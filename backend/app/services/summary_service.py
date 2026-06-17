"""
Services — Summary Service
Retrieve paper text → build prompt → call Gemini → store summary.
"""

import asyncio
import logging
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.paper import Paper
from app.models.summary import Summary
from app.prompts.summary import SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_PROMPT
from app.utils.exceptions import BadRequestException, NotFoundException, ServiceException

logger = logging.getLogger("app")

from app.utils.gemini import call_gemini_api_with_rotation


async def generate_summary(db: AsyncSession, paper_id: str) -> Summary:
    """
    Generate a structured summary for a paper using Gemini.

    Workflow:
    1. Retrieve paper text from SQLite
    2. Build prompt
    3. Call Gemini
    4. Store result

    Args:
        db: Async database session.
        paper_id: Target paper ID.

    Returns:
        Summary ORM object.
    """
    # Check if summary already exists
    existing = await db.execute(
        select(Summary).where(Summary.paper_id == paper_id)
    )
    existing_summary = existing.scalar_one_or_none()
    if existing_summary:
        logger.info(f"Returning cached summary for paper_id={paper_id}")
        return existing_summary

    # Get paper
    paper_result = await db.execute(
        select(Paper).where(Paper.paper_id == paper_id)
    )
    paper = paper_result.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")

    if paper.status != "ready":
        raise BadRequestException(
            f"Paper is not ready for summarization (status='{paper.status}'). "
            "Please wait for processing to complete."
        )

    if not paper.full_text or len(paper.full_text.strip()) < 100:
        raise BadRequestException("Paper has insufficient text for summarization.")

    # Build prompt (Use 60,000 characters safely for Gemini's massive context)
    paper_text = paper.full_text[:60000]
    prompt = SUMMARY_USER_PROMPT.format(paper_text=paper_text)

    logger.info(f"Generating summary for paper_id={paper_id} via Gemini...")

    try:
        summary_text = await call_gemini_api_with_rotation(prompt, SUMMARY_SYSTEM_PROMPT)
    except Exception as e:
        logger.error(f"Gemini summary generation failed: {e}", exc_info=True)
        raise ServiceException(f"Summary generation failed: {str(e)}")

    # Store summary
    summary = Summary(paper_id=paper_id, summary=summary_text)
    db.add(summary)
    await db.flush()
    await db.refresh(summary)
    logger.info(f"Summary stored for paper_id={paper_id}, id={summary.id}")
    return summary
