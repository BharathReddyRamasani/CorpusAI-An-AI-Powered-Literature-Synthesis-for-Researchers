"""
Agents — RAG Agent (Single-Paper Q&A with Agentic Loop)
Uses LangGraph StateGraph with Gemini + search_single_paper tool.

Loop: Agent → (tool call?) → Tool Node → Agent → ... → Extract Sources → END
"""

import asyncio
import logging
from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph
from app.services.agents.tools import ToolNode

from app.config import settings
from app.services.agents.state import AgentState
from app.services.agents.tools import search_single_paper, _LLM_EXECUTOR

logger = logging.getLogger("app")

# Tools available to the RAG Agent
RAG_TOOLS = [search_single_paper]
tool_node = ToolNode(RAG_TOOLS)


def _get_llm():
    """Instantiate Groq LLM with tool binding and key rotation."""
    from app.services.agents.tools import get_llm_with_rotation
    return get_llm_with_rotation(tools_list=RAG_TOOLS)


# ── Graph Nodes ───────────────────────────────────────────────────────────────

def agent_node(state: AgentState) -> dict:
    """Invoke Groq. It will either call a tool or produce a final answer."""
    paper_id = state.get("paper_id", "")
    section = state.get("section")

    system = SystemMessage(content=(
        "You are an expert AI Research Assistant answering questions about a specific research paper.\n"
        f"The user is asking about the paper with ID: '{paper_id}'. Do NOT ask the user for the paper ID, it is already provided to you.\n"
        + (f"Focus on section: {section}\n" if section else "")
        + "CRITICAL INSTRUCTION: You MUST ALWAYS call the `search_single_paper` tool first to find relevant context from this paper before answering.\n"
        f"When calling the tool, ALWAYS use '{paper_id}' as the paper_id argument.\n"
        "If the search result is empty or insufficient, rewrite the query and search again.\n"
        "Do not answer from general knowledge; rely strictly on the tool's output."
    ))

    llm = _get_llm()
    messages = [system] + state["messages"]
    
    # Fix for google-genai SDK crash: "contents are required"
    for msg in messages:
        if getattr(msg, "type", "") == "ai" and not msg.content:
            msg.content = " "
            
    logger.info("[RAG Agent] Invoking LLM...")
    response = llm.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> Literal["tools", "extract"]:
    """Route: if last message has tool calls → run tools; else → extract sources."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "extract"


def extract_sources_node(state: AgentState) -> dict:
    """Collect text snippets from all ToolMessage results."""
    snippets = []
    for msg in state["messages"]:
        if hasattr(msg, "name") and getattr(msg, "name", None) == "search_single_paper":
            content = getattr(msg, "content", "")
            if content and content != "No relevant information found in this paper for that query.":
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

async def run(question: str, paper_id: str, section: str = None, history: list[dict] = None, **kwargs) -> tuple[str, list[str]]:
    """
    Run the RAG agent for a single-paper Q&A.

    Returns:
        (answer, source_snippets)
    """
    from langchain_core.messages import AIMessage
    
    messages = []
    if history:
        for h in history[-5:]:  # Keep only the last 5 exchanges to avoid context bloat
            messages.append(HumanMessage(content=h["question"]))
            messages.append(AIMessage(content=h["answer"]))
            
    messages.append(HumanMessage(content=question))

    initial_state: AgentState = {
        "messages": messages,
        "paper_id": paper_id,
        "paper_ids": None,
        "section": section,
        "task": "rag",
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
        # LangChain sometimes returns Groq output as a list of parts
        answer = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in answer
        )
    elif not isinstance(answer, str):
        answer = str(answer)
        
    sources = final_state.get("source_snippets", [])

    logger.info(f"[RAG Agent] Done. Answer length={len(answer)}, sources={len(sources)}")
    return answer, sources
