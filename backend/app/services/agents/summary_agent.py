"""
Agents — Summary Agent (Single Gemini Call)
Fetches paper full text from DB, builds a structured prompt,
calls Gemini, and returns the summary text.
"""

import logging

from app.prompts.summary import SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_PROMPT
from app.services.agents.tools import fetch_paper_text_async
from app.utils.exceptions import BadRequestException, NotFoundException
from app.utils.groq_client import call_groq_api_with_rotation

logger = logging.getLogger("app")


async def run(paper_id: str, db, **kwargs) -> str:
    """
    Generate a structured summary for a research paper.

    Args:
        paper_id: Target paper ID.
        db:       Async SQLAlchemy session.

    Returns:
        Summary text (markdown formatted).
    """
    logger.info(f"[Summary Agent] Generating summary for paper_id={paper_id}")

    full_text = await fetch_paper_text_async(paper_id, db)

    if not full_text or len(full_text.strip()) < 100:
        raise BadRequestException("Paper has insufficient text for summarization.")

    # Groq free tier limit is 6000 TPM (~24,000 chars total), so we truncate aggressively
    paper_text = full_text[:8000]
    prompt = SUMMARY_USER_PROMPT.format(paper_text=paper_text)

    logger.info(f"[Summary Agent] Invoking Groq LLM...")
    summary_text = await call_groq_api_with_rotation(prompt, SUMMARY_SYSTEM_PROMPT, max_tokens=800)
    logger.info(f"[Summary Agent] Done. length={len(summary_text)}")
    return summary_text
