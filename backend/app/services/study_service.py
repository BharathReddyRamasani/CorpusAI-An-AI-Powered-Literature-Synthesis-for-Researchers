"""
Services — Study Service (Thin Wrapper → Supervisor)
Delegates to the Study Agent via the Supervisor router.
"""

import json
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.advanced import Flashcard, Quiz
from app.models.paper import Paper
from app.schemas.research import FlashcardResponse, QuizResponse
from app.utils.exceptions import NotFoundException

logger = logging.getLogger("app")


async def generate_flashcards(db: AsyncSession, paper_id: str, user_id: int) -> list[FlashcardResponse]:
    """Generate or return cached flashcards for a paper via Study Agent."""

    # Return cached flashcards if already generated
    result = await db.execute(select(Flashcard).where(Flashcard.paper_id == paper_id))
    existing = list(result.scalars().all())
    if existing:
        return [FlashcardResponse(question=f.question, answer=f.answer) for f in existing]

    # Fetch paper for context
    paper_res = await db.execute(
        select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id)
    )
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")

    logger.info(f"[Study Service] Dispatching flashcards for paper_id={paper_id}")

    from app.services.agents.supervisor import dispatch
    data = await dispatch(
        "flashcards",
        paper_id=paper_id,
        db=db,
        paper_title=paper.title or "",
        paper_abstract=paper.abstract or "",
    )

    # Persist and return
    flashcards = []
    for item in data:
        f = Flashcard(paper_id=paper_id, question=item["question"], answer=item["answer"])
        db.add(f)
        flashcards.append(FlashcardResponse(question=item["question"], answer=item["answer"]))

    await db.flush()
    return flashcards


async def generate_quiz(db: AsyncSession, paper_id: str, user_id: int) -> list[QuizResponse]:
    """Generate or return cached quiz questions for a paper via Study Agent."""

    # Return cached quiz if already generated
    result = await db.execute(select(Quiz).where(Quiz.paper_id == paper_id))
    existing = list(result.scalars().all())
    if existing:
        return [
            QuizResponse(
                question=q.question, 
                options=q.options if isinstance(q.options, list) else json.loads(q.options), 
                answer=q.answer
            )
            for q in existing
        ]

    # Fetch paper for context
    paper_res = await db.execute(
        select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id)
    )
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")

    logger.info(f"[Study Service] Dispatching quiz for paper_id={paper_id}")

    from app.services.agents.supervisor import dispatch
    data = await dispatch(
        "quiz",
        paper_id=paper_id,
        db=db,
        paper_title=paper.title or "",
        paper_abstract=paper.abstract or "",
    )

    # Persist and return
    quizzes = []
    for item in data:
        q = Quiz(
            paper_id=paper_id,
            question=item["question"],
            options=item["options"],
            answer=item["answer"],
        )
        db.add(q)
        quizzes.append(QuizResponse(
            question=item["question"],
            options=item["options"],
            answer=item["answer"],
        ))

    await db.flush()
    return quizzes
