"""
Services — Study Mode (Flashcards & Quizzes)
"""

import json
import logging
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.advanced import Flashcard, Quiz
from app.models.paper import Paper
from app.schemas.research import FlashcardResponse, QuizResponse
from app.utils.exceptions import NotFoundException, ServiceException
from app.utils.gemini import call_gemini_api_with_rotation

logger = logging.getLogger("app")


async def generate_flashcards(db: AsyncSession, paper_id: str, user_id: int) -> List[FlashcardResponse]:
    # Check if already generated
    result = await db.execute(select(Flashcard).where(Flashcard.paper_id == paper_id))
    existing = list(result.scalars().all())
    if existing:
        return [FlashcardResponse(question=f.question, answer=f.answer) for f in existing]

    # Fetch paper
    paper_res = await db.execute(select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id))
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
        
    system_prompt = "You are an expert AI tutor. Return ONLY valid JSON."
    prompt = f"""Generate 10 flashcards from the following research paper. Focus on concepts, methodology, and findings.
Return the result STRICTLY as a JSON array of objects with this exact structure:
[
    {{"question": "What is...", "answer": "It is..."}}
]

Paper Title: {paper.title}
Abstract: {paper.abstract}
Full Text (partial): {paper.full_text[:10000] if paper.full_text else ""}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        flashcards = []
        for item in data:
            f = Flashcard(paper_id=paper_id, question=item["question"], answer=item["answer"])
            db.add(f)
            flashcards.append(FlashcardResponse(**item))
            
        await db.flush()
        return flashcards
    except Exception as e:
        logger.error(f"Failed to parse JSON for flashcards: {response_text}")
        raise ServiceException("Failed to generate flashcards.")


async def generate_quiz(db: AsyncSession, paper_id: str, user_id: int) -> List[QuizResponse]:
    # Check if already generated
    result = await db.execute(select(Quiz).where(Quiz.paper_id == paper_id))
    existing = list(result.scalars().all())
    if existing:
        return [QuizResponse(question=q.question, options=json.loads(q.options), answer=q.answer) for q in existing]

    # Fetch paper
    paper_res = await db.execute(select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id))
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
        
    system_prompt = "You are an expert AI tutor. Return ONLY valid JSON."
    prompt = f"""Generate 10 multiple-choice questions from the following research paper.
Provide exactly 4 options and the correct answer.
Return the result STRICTLY as a JSON array of objects with this exact structure:
[
    {{
        "question": "What is...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answer": "Option 2"
    }}
]

Paper Title: {paper.title}
Abstract: {paper.abstract}
Full Text (partial): {paper.full_text[:10000] if paper.full_text else ""}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        quizzes = []
        for item in data:
            q = Quiz(paper_id=paper_id, question=item["question"], options=json.dumps(item["options"]), answer=item["answer"])
            db.add(q)
            quizzes.append(QuizResponse(**item))
            
        await db.flush()
        return quizzes
    except Exception as e:
        logger.error(f"Failed to parse JSON for quiz: {response_text}")
        raise ServiceException("Failed to generate quiz.")
