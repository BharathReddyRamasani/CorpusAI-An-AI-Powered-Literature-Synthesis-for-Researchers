"""
Agents — Shared State Definition
Used by all LangGraph agents in the multi-agent system.
"""

import operator
from typing import Any, TypedDict, Annotated

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    Shared state passed through all LangGraph agent graphs.
    
    Fields:
        messages:        Full conversation history (HumanMessage, AIMessage, ToolMessage).
        paper_id:        Single paper context (for RAG / Summary / Study agents).
        paper_ids:       Multi-paper context (for Global Chat / Analysis agents).
        section:         Optional section filter for RAG queries.
        task:            Task type string: "rag", "global_chat", "summary",
                         "flashcards", "quiz", "analyze", "compare",
                         "gaps", "literature", "citation".
        source_snippets: Text snippets extracted from ChromaDB tool results.
        result:          Structured output dict (for Analysis / Study agents).
    """

    messages: Annotated[list[BaseMessage], operator.add]
    paper_id: str | None
    paper_ids: list[str] | None
    section: str | None
    task: str
    source_snippets: list[str]
    result: Any
