"""
Agents — Analysis Agent (Single Gemini Call)
Handles all multi-paper analysis tasks:
  - analyze:    Common models, datasets, trends
  - compare:    Side-by-side comparison table
  - gaps:       Research gap detection
  - literature: Literature review generation
  - citation:   Citation intelligence

Routes via task string. Fetches appropriate context from DB then
calls Gemini once and parses the JSON response.
"""

import json
import logging

from app.services.agents.tools import fetch_abstracts_async, fetch_citations_async
from app.utils.exceptions import ServiceException
from app.utils.groq_client import call_groq_api_with_rotation

logger = logging.getLogger("app")

_SYSTEM_PROMPT = "You are an expert AI research assistant. Return ONLY valid JSON."
_SYSTEM_PROMPT_LIT = "You are an expert academic writer. Return ONLY valid JSON."


def _clean_json(raw: str) -> dict | list:
    """Strip markdown fences and parse JSON."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    # Try direct parse first
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        # Try finding JSON boundaries
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1:
            return json.loads(clean[start:end + 1])
        start = clean.find("[")
        end = clean.rfind("]")
        if start != -1 and end != -1:
            return json.loads(clean[start:end + 1])
        raise


async def run(task: str, paper_ids: list[str], db, user_id: int = None, **kwargs) -> dict:
    """
    Run an analysis task over one or more papers.

    Args:
        task:      One of: analyze, compare, gaps, literature, citation.
        paper_ids: List of paper IDs.
        db:        Async SQLAlchemy session.
        user_id:   Current user ID (for citation intelligence).

    Returns:
        Parsed dict matching the Pydantic schema for this task.
    """
    logger.info(f"[Analysis Agent] task={task}, papers={len(paper_ids)}")

    if task == "citation":
        # Citation intelligence — uses all user papers, not just selected
        from sqlalchemy import select
        from app.models.paper import Paper
        result = await db.execute(
            select(Paper.paper_id).where(Paper.user_id == user_id)
        )
        all_ids = [r for r in result.scalars().all()]
        context = await fetch_citations_async(all_ids, db)
        prompt = f"""Analyze the following list of citations extracted from a user's research library.
Identify the most frequently referenced papers, models, and datasets.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "top_papers": ["paper title 1", "paper title 2"],
    "top_models": ["model1", "model2"],
    "top_datasets": ["dataset1", "dataset2"]
}}

Citations:
{context}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1500)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Analysis Agent] Failed to parse citation JSON: {raw[:200]}")
            raise ServiceException("Failed to generate citation intelligence.")

    # All other tasks use abstracts as context
    context = await fetch_abstracts_async(paper_ids, db)

    if task == "analyze":
        prompt = f"""Analyze the following research papers and identify common models, datasets, and research trends.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "common_models": ["model1", "model2"],
    "common_datasets": ["dataset1", "dataset2"],
    "research_trends": ["trend1", "trend2"]
}}

Papers:
{context}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1500)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Analysis Agent] Failed to parse analyze JSON: {raw[:200]}")
            raise ServiceException("Failed to generate multi-paper analysis.")

    elif task == "compare":
        prompt = f"""Compare the following research papers based on: dataset, model, accuracy, methodology, limitations.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "papers": ["Paper ID 1", "Paper ID 2"],
    "comparison": {{
        "dataset": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "model": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "accuracy": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "methodology": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "limitations": {{"Paper ID 1": "...", "Paper ID 2": "..."}}
    }}
}}

Papers:
{context}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1500)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Analysis Agent] Failed to parse compare JSON: {raw[:200]}")
            raise ServiceException("Failed to generate paper comparison.")

    elif task == "gaps":
        prompt = f"""Analyze the limitations and future work of the following research papers.
Identify 3-5 potential research gaps or opportunities.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "gaps": [
        {{"gap": "Short title of the gap", "reason": "Detailed explanation based on the papers"}}
    ]
}}

Papers:
{context}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1500)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Analysis Agent] Failed to parse gaps JSON: {raw[:200]}")
            raise ServiceException("Failed to generate research gaps.")

    elif task == "literature":
        prompt = f"""Generate a mini literature review based on the following research papers.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "introduction": "...",
    "existing_methods": "...",
    "challenges": "...",
    "future_directions": "...",
    "conclusion": "..."
}}

Papers:
{context}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT_LIT, max_tokens=1500)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Analysis Agent] Failed to parse literature JSON: {raw[:200]}")
            raise ServiceException("Failed to generate literature review.")

    else:
        raise ValueError(f"[Analysis Agent] Unknown task: {task}")
