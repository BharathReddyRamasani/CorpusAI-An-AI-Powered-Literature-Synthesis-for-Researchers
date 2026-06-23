"""
Agents — Study Agent (Single Gemini Call)
Handles flashcard and quiz generation from a single paper.
"""

import json
import logging

from app.services.agents.tools import fetch_paper_text_async
from app.utils.exceptions import NotFoundException, ServiceException
from app.utils.groq_client import call_groq_api_with_rotation

logger = logging.getLogger("app")

_SYSTEM_PROMPT = "You are an expert AI tutor. Return ONLY valid JSON."


def _clean_json(raw: str) -> list:
    """Strip markdown fences and parse JSON array."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        start = clean.find("[")
        end = clean.rfind("]")
        if start != -1 and end != -1:
            return json.loads(clean[start:end + 1])
        raise


async def run(task: str, paper_id: str, db, paper_title: str = "", paper_abstract: str = "", **kwargs) -> list:
    """
    Generate flashcards or quiz questions for a paper.

    Args:
        task:           "flashcards" or "quiz"
        paper_id:       Target paper ID.
        db:             Async SQLAlchemy session.
        paper_title:    Paper title (for richer prompt context).
        paper_abstract: Paper abstract (for richer prompt context).

    Returns:
        List of dicts (flashcard or quiz format).
    """
    logger.info(f"[Study Agent] task={task}, paper_id={paper_id}")

    full_text = await fetch_paper_text_async(paper_id, db)
    text_excerpt = (full_text or "")[:5000]

    if task == "flashcards":
        prompt = f"""Generate 10 flashcards from the following research paper.
Focus on key concepts, methodology, and findings.
Return the result STRICTLY as a JSON array of objects with this exact structure:
[
    {{"question": "What is...", "answer": "It is..."}}
]

Paper Title: {paper_title}
Abstract: {paper_abstract}
Full Text (partial): {text_excerpt}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1000)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Study Agent] Failed to parse flashcards JSON: {raw[:200]}")
            raise ServiceException("Failed to generate flashcards.")

    elif task == "quiz":
        prompt = f"""Generate 10 multiple-choice questions from the following research paper.
Provide exactly 4 options and mark the correct answer.
Return the result STRICTLY as a JSON array of objects with this exact structure:
[
    {{
        "question": "What is...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answer": "Option 2"
    }}
]

Paper Title: {paper_title}
Abstract: {paper_abstract}
Full Text (partial): {text_excerpt}
"""
        raw = await call_groq_api_with_rotation(prompt, _SYSTEM_PROMPT, max_tokens=1000)
        try:
            return _clean_json(raw)
        except Exception:
            logger.error(f"[Study Agent] Failed to parse quiz JSON: {raw[:200]}")
            raise ServiceException("Failed to generate quiz.")

    else:
        raise ValueError(f"[Study Agent] Unknown task: {task}")
