"""
Agents — Supervisor (Simple Router)
Routes all incoming tasks to the correct specialized agent.
No LLM call is made here — routing is purely deterministic based on task_type.

ROUTE MAP:
  "rag"         → rag_agent.run()           (LangGraph loop)
  "global_chat" → global_chat_agent.run()   (LangGraph loop)
  "summary"     → summary_agent.run()       (Single Gemini call)
  "flashcards"  → study_agent.run()         (Single Gemini call)
  "quiz"        → study_agent.run()         (Single Gemini call)
  "analyze"     → analysis_agent.run()      (Single Gemini call)
  "compare"     → analysis_agent.run()      (Single Gemini call)
  "gaps"        → analysis_agent.run()      (Single Gemini call)
  "literature"  → analysis_agent.run()      (Single Gemini call)
  "citation"    → analysis_agent.run()      (Single Gemini call)
"""

import logging
from typing import Any

from app.services.agents import (
    analysis_agent,
    global_chat_agent,
    rag_agent,
    study_agent,
    summary_agent,
)

logger = logging.getLogger("app")

# ── Route Map ─────────────────────────────────────────────────────────────────

_ROUTE_MAP = {
    "rag":         rag_agent.run,
    "global_chat": global_chat_agent.run,
    "summary":     summary_agent.run,
    "flashcards":  study_agent.run,
    "quiz":        study_agent.run,
    "analyze":     analysis_agent.run,
    "compare":     analysis_agent.run,
    "gaps":        analysis_agent.run,
    "literature":  analysis_agent.run,
    "citation":    analysis_agent.run,
}


# ── Dispatch Function ─────────────────────────────────────────────────────────

async def dispatch(task_type: str, **kwargs) -> Any:
    """
    Route a task to the appropriate agent and return its result.

    Args:
        task_type: One of the keys in _ROUTE_MAP above.
        **kwargs:  Passed directly to the agent's run() function.
                   Common kwargs: question, paper_id, paper_ids, section, db, user_id, task.

    Returns:
        The agent's result (type varies by agent).

    Raises:
        ValueError: If task_type is not recognized.
    """
    handler = _ROUTE_MAP.get(task_type)
    if not handler:
        raise ValueError(
            f"[Supervisor] Unknown task_type: '{task_type}'. "
            f"Valid options: {list(_ROUTE_MAP.keys())}"
        )

    logger.info(f"[Supervisor] Dispatching task='{task_type}' → {handler.__module__}")
    
    try:
        result = await handler(task=task_type, **kwargs)
        logger.info(f"[Supervisor] Task '{task_type}' completed.")
        return result
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "exhausted" in err_str or "quota" in err_str or "rate limit" in err_str:
            from app.utils.exceptions import AppException
            logger.warning(f"[Supervisor] Rate limit exhausted for task '{task_type}': {e}")
            raise AppException(
                status_code=429,
                detail="All API keys are currently rate-limited or quota exceeded. Please check your billing or wait a minute before trying again.",
                error_code="RATE_LIMIT_EXCEEDED"
            )
        # Re-raise anything else
        raise
