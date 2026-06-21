"""
Services — RAG Service (Thin Wrapper → Supervisor)
Delegates to the Agentic RAG loop via the Supervisor router.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.chat import ChatHistory
from app.models.paper import Paper
from app.utils.exceptions import BadRequestException, NotFoundException

logger = logging.getLogger("app")


async def answer_question(
    db: AsyncSession,
    paper_id: str,
    user_id: int,
    question: str,
    section: str = None,
) -> tuple[str, list[str]]:
    """
    Full Agentic RAG pipeline via Supervisor.
    1. Validate paper exists and is ready.
    2. Dispatch to RAG Agent (iterative LangGraph loop).
    3. Store Q&A in chat history.

    Returns:
        (answer_text, source_snippets)
    """
    # Validate paper
    paper_result = await db.execute(
        select(Paper).where(Paper.paper_id == paper_id)
    )
    paper = paper_result.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")

    if paper.status != "ready":
        raise BadRequestException(
            f"Paper is not ready for Q&A (status='{paper.status}'). "
            "Please wait for processing to complete."
        )

    logger.info(f"[RAG Service] Dispatching to RAG Agent: paper_id={paper_id}")

    from app.services.agents.supervisor import dispatch
    answer, source_snippets = await dispatch(
        "rag",
        question=question,
        paper_id=paper_id,
        section=section,
        db=db,
    )

    # Store chat history
    await _store_chat(db, paper_id, user_id, question, answer)
    return answer, source_snippets


async def _store_chat(
    db: AsyncSession,
    paper_id: str,
    user_id: int,
    question: str,
    answer: str,
) -> None:
    """Persist a Q&A pair to chat_history."""
    chat = ChatHistory(
        paper_id=paper_id,
        user_id=user_id,
        question=question,
        answer=answer,
    )
    db.add(chat)
    await db.flush()


async def get_chat_history(
    db: AsyncSession, paper_id: str, user_id: int
) -> list[ChatHistory]:
    """Retrieve all chat history for a paper."""
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.paper_id == paper_id, ChatHistory.user_id == user_id)
        .order_by(ChatHistory.timestamp.asc())
    )
    return list(result.scalars().all())
