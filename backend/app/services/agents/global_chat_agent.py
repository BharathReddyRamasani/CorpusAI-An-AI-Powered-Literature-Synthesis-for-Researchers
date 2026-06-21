"""
Agents — Global Chat Agent (Multi-Paper Q&A with Agentic Loop)
Same structure as RAG Agent, but uses the search_multi_paper tool
to search across multiple papers simultaneously.
"""

import asyncio
import logging
from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from app.services.agents.tools import ToolNode

from app.config import settings
from app.services.agents.state import AgentState
from app.services.agents.tools import search_multi_paper, duckduckgo_web_search, _LLM_EXECUTOR

logger = logging.getLogger("app")

GLOBAL_TOOLS = [search_multi_paper, duckduckgo_web_search]
tool_node = ToolNode(GLOBAL_TOOLS)


def _get_llm():
    """Instantiate Gemini LLM with tool binding and key rotation."""
    from app.services.agents.tools import get_llm_with_rotation
    return get_llm_with_rotation(tools_list=GLOBAL_TOOLS)


# ── Graph Nodes ───────────────────────────────────────────────────────────────

def agent_node(state: AgentState) -> dict:
    paper_ids = state.get("paper_ids") or []

    system = SystemMessage(content=(
        "You are an expert AI Research Assistant performing cross-document analysis.\n"
        f"You are analyzing {len(paper_ids)} research paper(s). The Paper IDs are: {paper_ids}\n"
        "Do NOT ask the user for the paper IDs, they are already provided to you.\n"
        "CRITICAL INSTRUCTION: You MUST ALWAYS call the `search_multi_paper` tool with the provided paper_ids "
        "to find relevant context before answering.\n"
        "Compare, contrast, and synthesize information across papers where appropriate.\n"
        "If the search result is empty or insufficient, search again with a more specific query.\n"
        "Do not answer from general knowledge; rely strictly on the tool's output."
    ))

    llm = _get_llm()
    messages = [system] + state["messages"]

    # Fix for google-genai SDK crash: "contents are required"
    for msg in messages:
        if getattr(msg, "type", "") == "ai" and not msg.content:
            msg.content = " "

    logger.info("[Global Chat Agent] Invoking LLM...")
    response = llm.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> Literal["tools", "extract"]:
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "extract"


def extract_sources_node(state: AgentState) -> dict:
    snippets = []
    for msg in state["messages"]:
        if hasattr(msg, "name") and getattr(msg, "name", None) == "search_multi_paper":
            content = getattr(msg, "content", "")
            if content and content != "No relevant information found across the selected papers for that query.":
                snippet = content[:200] + "..." if len(content) > 200 else content
                snippets.append(snippet)
    return {"source_snippets": snippets}


# ── Build & Compile Graph ─────────────────────────────────────────────────────

def _build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("extract", extract_sources_node)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {
        "tools": "tools",
        "extract": "extract",
    })
    graph.add_edge("tools", "agent")
    graph.add_edge("extract", END)

    return graph.compile()


_compiled = _build_graph()


# ── Public Interface ──────────────────────────────────────────────────────────

async def run(question: str, paper_ids: list[str], **kwargs) -> tuple[str, list[str]]:
    """
    Run the Global Chat agent for multi-paper Q&A.

    Returns:
        (answer, source_snippets)
    """
    initial_state: AgentState = {
        "messages": [HumanMessage(content=question)],
        "paper_id": None,
        "paper_ids": paper_ids,
        "section": None,
        "task": "global_chat",
        "source_snippets": [],
        "result": None,
    }

    loop = asyncio.get_event_loop()
    final_state = await loop.run_in_executor(
        _LLM_EXECUTOR,  # PERF: Dedicated pool, never blocks shared executor
        lambda: _compiled.invoke(initial_state)
    )

    last_msg = final_state["messages"][-1]
    answer = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
    
    if isinstance(answer, list):
        # LangChain sometimes returns Gemini output as a list of parts
        answer = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in answer
        )
    elif not isinstance(answer, str):
        answer = str(answer)
        
    sources = final_state.get("source_snippets", [])

    logger.info(f"[Global Chat Agent] Done. Answer length={len(answer)}, sources={len(sources)}")
    return answer, sources
