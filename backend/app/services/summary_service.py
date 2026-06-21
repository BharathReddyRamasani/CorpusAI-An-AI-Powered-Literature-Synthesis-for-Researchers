"""
Services — Summary Service (Thin Wrapper → Supervisor)
Delegates to the Summary Agent via the Supervisor router.
"""

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.paper import Paper
from app.models.summary import Summary
from app.utils.exceptions import BadRequestException, NotFoundException

logger = logging.getLogger("app")


async def generate_summary(db: AsyncSession, paper_id: str) -> Summary:
    """
    Generate a structured summary for a paper using the Summary Agent.

    Workflow:
    1. Check if summary already cached in DB.
    2. Validate paper exists and is ready.
    3. Dispatch to Summary Agent via Supervisor.
    4. Store and return the result.
    """
    # Return cached summary if already exists
    existing = await db.execute(
        select(Summary).where(Summary.paper_id == paper_id)
    )
    existing_summary = existing.scalars().first()
    if existing_summary:
        logger.info(f"[Summary Service] Returning cached summary for paper_id={paper_id}")
        return existing_summary

    # Validate paper
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

    logger.info(f"[Summary Service] Dispatching to Summary Agent: paper_id={paper_id}")

    from app.services.agents.supervisor import dispatch
    summary_text = await dispatch("summary", paper_id=paper_id, db=db)

    # Store summary
    summary = Summary(paper_id=paper_id, summary=summary_text)
    db.add(summary)
    await db.flush()
    await db.refresh(summary)
    logger.info(f"[Summary Service] Summary stored for paper_id={paper_id}")
    return summary
