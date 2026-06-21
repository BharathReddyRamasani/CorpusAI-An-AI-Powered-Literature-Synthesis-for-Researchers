"""
Agents — Tool Definitions
All @tool functions shared across the multi-agent system.
Each tool wraps an existing database or ChromaDB operation.
"""

import logging
import concurrent.futures
from typing import Optional

from langchain_core.tools import tool

from app.config import settings
from app.db.chromadb import get_collection
from app.services import embedding_service
from app.utils.groq_client import _get_api_keys

logger = logging.getLogger("app")

# ── Performance: Dedicated thread pool for LLM calls ─────────────────────────
# Prevents LLM blocking calls from starving the shared event loop executor
_LLM_EXECUTOR = concurrent.futures.ThreadPoolExecutor(
    max_workers=8,
    thread_name_prefix="llm_worker"
)

# ── Performance: LLM singleton cache ─────────────────────────────────────────
# LLM objects are built ONCE per unique tool-set and reused across all requests
_llm_cache: dict = {}

def get_llm_with_rotation(tools_list=None):
    """
    Returns a cached ChatGroq instance with built-in fallbacks
    across all available Groq keys to handle RateLimit errors.
    """
    from langchain_groq import ChatGroq
    
    # Use frozenset of tool names as cache key
    cache_key = frozenset(t.name for t in (tools_list or []))
    if cache_key in _llm_cache:
        return _llm_cache[cache_key]
    
    # Deduplicate keys
    all_keys = _get_api_keys()
    seen = set()
    keys = []
    for k in all_keys:
        if k not in seen:
            seen.add(k)
            keys.append(k)
    
    if not keys:
        raise RuntimeError("No Groq API keys configured.")
    
    logger.info(f"[LLM] Building fallback chain with {len(keys)} unique keys.")
    
    llms = [
        ChatGroq(
            model_name=settings.groq_model,
            groq_api_key=key,
            temperature=0.2,
            max_retries=0,
        )
        for key in keys
    ]
    
    if tools_list:
        llms = [llm.bind_tools(tools_list) for llm in llms]
    
    primary_llm = llms[0]
    result = primary_llm.with_fallbacks(llms[1:]) if len(llms) > 1 else primary_llm
    
    # Cache the compiled chain
    _llm_cache[cache_key] = result
    logger.info(f"[LLM] Chain cached for tool-set: {[t.name for t in (tools_list or [])]}")
    return result



# ── Single-Paper Vector Search ────────────────────────────────────────────────

@tool
def search_single_paper(query: str, paper_id: str, section: Optional[str] = None) -> str:
    """
    Search the vector database for relevant paragraphs from a single research paper.
    Use this whenever you need specific facts, data, or context from the paper.
    If the first result is not enough, rewrite the query and call this tool again.

    Args:
        query:    The search query (can be the user question or a refined sub-question).
        paper_id: The ID of the paper to search within.
        section:  Optional. Restrict search to a specific section (e.g., 'methodology').
    """
    logger.info(f"[Tool] search_single_paper | query='{query[:60]}' | paper_id={paper_id}")

    embedding = embedding_service.generate_embedding(query)
    collection = get_collection()

    where_filter: dict = {"paper_id": paper_id}
    if section and section.lower() not in ("none", "null", ""):
        where_filter["section_name"] = section

    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(settings.rag_top_k, collection.count() or 1),
        where=where_filter,
    )

    docs: list[str] = results.get("documents", [[]])[0]
    metas: list[dict] = results.get("metadatas", [[]])[0]

    if not docs:
        return "No relevant information found in this paper for that query."

    parts = []
    for doc, meta in zip(docs, metas):
        sec = meta.get("section_name", "unknown")
        parts.append(f"[Section: {sec}]\n{doc}")

    return "\n\n---\n\n".join(parts)


# ── Multi-Paper Vector Search ─────────────────────────────────────────────────

@tool
def search_multi_paper(query: str, paper_ids: list[str]) -> str:
    """
    Search the vector database across multiple research papers simultaneously.
    Use this for cross-document questions where you need to compare or synthesize
    information from several papers at once.

    Args:
        query:     The search query.
        paper_ids: List of paper IDs to search across.
    """
    logger.info(f"[Tool] search_multi_paper | query='{query[:60]}' | papers={len(paper_ids)}")

    embedding = embedding_service.generate_embedding(query)
    collection = get_collection()

    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(10, settings.rag_top_k * 2, collection.count() or 1),
        where={"paper_id": {"$in": paper_ids}},
    )

    docs: list[str] = results.get("documents", [[]])[0]
    metas: list[dict] = results.get("metadatas", [[]])[0]

    if not docs:
        return "No relevant information found across the selected papers for that query."

    parts = []
    for doc, meta in zip(docs, metas):
        pid = meta.get("paper_id", "unknown")
        sec = meta.get("section_name", "unknown")
        parts.append(f"[Paper: {pid} | Section: {sec}]\n{doc}")

    return "\n\n---\n\n".join(parts)


# ── Web Search ────────────────────────────────────────────────────────────────

@tool
def duckduckgo_web_search(query: str) -> str:
    """
    Autonomously search the internet using DuckDuckGo to find external information,
    papers, or context not found in the user's uploaded documents.
    Use this when the user asks a general question or asks for external sources.

    Args:
        query: The search query string.
    """
    logger.info(f"[Tool] duckduckgo_web_search | query='{query}'")
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            
        if not results:
            return "No web search results found for that query."
            
        parts = []
        for r in results:
            title = r.get("title", "Untitled")
            href = r.get("href", "")
            body = r.get("body", "")
            parts.append(f"[{title}]({href})\n{body}")
            
        return "\n\n---\n\n".join(parts)
    except Exception as e:
        logger.error(f"[Tool] Web search failed: {e}")
        return f"Web search failed: {e}"


# ── DB Fetch Helpers (used by simple call agents) ────────────────────────────

def fetch_paper_text_sync(paper_id: str, db) -> str:
    """
    Synchronously fetch the full text of a paper from SQLite.
    Used by Summary and Study agents (not a @tool — called directly).
    """
    import asyncio
    from sqlalchemy import select
    from app.models.paper import Paper

    async def _fetch():
        from sqlalchemy.ext.asyncio import AsyncSession
        result = await db.execute(select(Paper).where(Paper.paper_id == paper_id))
        paper = result.scalar_one_or_none()
        if not paper:
            return ""
        return paper.full_text or ""

    # Already inside async context — use await in calling code
    raise RuntimeError("Use fetch_paper_text_async instead")


async def fetch_paper_text_async(paper_id: str, db) -> str:
    """Fetch full text of a paper from SQLite (async)."""
    from sqlalchemy import select
    from app.models.paper import Paper

    result = await db.execute(select(Paper).where(Paper.paper_id == paper_id))
    paper = result.scalar_one_or_none()
    if not paper:
        return ""
    return paper.full_text or ""


async def fetch_abstracts_async(paper_ids: list[str], db) -> str:
    """Fetch title + abstract for multiple papers (async)."""
    from sqlalchemy import select
    from app.models.paper import Paper

    result = await db.execute(
        select(Paper).where(Paper.paper_id.in_(paper_ids))
    )
    papers = list(result.scalars().all())

    if not papers:
        return "No papers found."

    parts = []
    for p in papers:
        parts.append(f"Paper ID: {p.paper_id}\nTitle: {p.title}\nAbstract: {p.abstract}")

    return "\n\n".join(parts)


async def fetch_citations_async(paper_ids: list[str], db) -> str:
    """Fetch raw citation text for multiple papers (async)."""
    import random
    from sqlalchemy import select
    from app.models.citation import Citation

    result = await db.execute(
        select(Citation.raw_text).where(Citation.paper_id.in_(paper_ids))
    )
    citations = [r for r in result.scalars().all() if r]

    if not citations:
        return "No citations found."

    return "\n".join(citations)

# ── Custom ToolNode (bypassing langgraph.prebuilt issues) ─────────────────────

from langchain_core.messages import ToolMessage
import json

class ToolNode:
    """
    A simple node that runs tools requested in the last AIMessage.
    Replaces langgraph.prebuilt.ToolNode to avoid versioning/import issues.
    """
    def __init__(self, tools: list):
        self.tools_by_name = {tool.name: tool for tool in tools}

    def __call__(self, state: dict) -> dict:
        messages = state.get("messages", [])
        if not messages:
            return {"messages": []}
            
        last_message = messages[-1]
        out_messages = []
        
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            for tc in last_message.tool_calls:
                tool_name = tc["name"]
                tool_args = tc["args"]
                tool_id = tc["id"]
                
                tool_obj = self.tools_by_name.get(tool_name)
                if not tool_obj:
                    result = f"Error: Tool {tool_name} not found."
                else:
                    try:
                        result = str(tool_obj.invoke(tool_args))
                    except Exception as e:
                        result = f"Error: {e}"
                        
                out_messages.append(
                    ToolMessage(content=result, name=tool_name, tool_call_id=tool_id)
                )
                
        return {"messages": out_messages}

