"""
Services — Advanced Research Service (Thin Wrapper → Supervisor)
Delegates all multi-paper analysis and global chat tasks
to the appropriate agents via the Supervisor router.
"""

import json
import logging
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.research import (
    AnalysisResponse,
    CitationIntelligenceResponse,
    ComparisonResponse,
    GapsListResponse,
    GlobalChatResponse,
    LiteratureReviewResponse,
)
from app.models.advanced import LiteratureReview, ResearchGap
from app.utils.exceptions import NotFoundException, ServiceException

logger = logging.getLogger("app")


async def global_chat(
    paper_ids: List[str], user_id: int, question: str
) -> GlobalChatResponse:
    """Cross-Document Agentic RAG over selected papers."""
    logger.info(f"[Adv Research Service] Dispatching global_chat for {len(paper_ids)} papers")

    from app.services.agents.supervisor import dispatch
    answer, sources = await dispatch(
        "global_chat",
        question=question,
        paper_ids=paper_ids,
    )
    return GlobalChatResponse(answer=answer, sources=sources)


async def multi_paper_analysis(
    db: AsyncSession, paper_ids: List[str], user_id: int
) -> AnalysisResponse:
    """Analyze multiple papers for common models, datasets, and trends."""
    logger.info(f"[Adv Research Service] Dispatching analyze for {len(paper_ids)} papers")

    from app.services.agents.supervisor import dispatch
    data = await dispatch("analyze", paper_ids=paper_ids, db=db, user_id=user_id)
    return AnalysisResponse(**data)


async def compare_papers(
    db: AsyncSession, paper_ids: List[str], user_id: int
) -> ComparisonResponse:
    """Generate a side-by-side comparison of multiple papers."""
    logger.info(f"[Adv Research Service] Dispatching compare for {len(paper_ids)} papers")

    from app.services.agents.supervisor import dispatch
    data = await dispatch("compare", paper_ids=paper_ids, db=db, user_id=user_id)
    return ComparisonResponse(**data)


async def detect_gaps(
    db: AsyncSession, paper_ids: List[str], user_id: int
) -> GapsListResponse:
    """Identify research gaps across multiple papers."""
    logger.info(f"[Adv Research Service] Dispatching gaps for {len(paper_ids)} papers")

    from app.services.agents.supervisor import dispatch
    data = await dispatch("gaps", paper_ids=paper_ids, db=db, user_id=user_id)

    # Persist gaps to DB
    for g in data.get("gaps", []):
        gap_record = ResearchGap(
            user_id=user_id,
            paper_ids=json.dumps(paper_ids),
            gap=g["gap"],
            reason=g["reason"],
        )
        db.add(gap_record)
    await db.flush()

    return GapsListResponse(**data)


async def generate_literature_review(
    db: AsyncSession, paper_ids: List[str], user_id: int
) -> LiteratureReviewResponse:
    """Generate a mini literature review from multiple papers."""
    logger.info(f"[Adv Research Service] Dispatching literature for {len(paper_ids)} papers")

    from app.services.agents.supervisor import dispatch
    data = await dispatch("literature", paper_ids=paper_ids, db=db, user_id=user_id)

    # Persist literature review to DB
    content_md = (
        f"# Literature Review\n\n"
        f"## Introduction\n{data['introduction']}\n\n"
        f"## Existing Methods\n{data['existing_methods']}\n\n"
        f"## Challenges\n{data['challenges']}\n\n"
        f"## Future Directions\n{data['future_directions']}\n\n"
        f"## Conclusion\n{data['conclusion']}"
    )
    review_record = LiteratureReview(
        user_id=user_id,
        paper_ids=json.dumps(paper_ids),
        content=content_md,
    )
    db.add(review_record)
    await db.flush()

    return LiteratureReviewResponse(**data)


async def get_citation_intelligence(
    db: AsyncSession, user_id: int
) -> CitationIntelligenceResponse:
    """Analyze most referenced papers, models, and datasets across the user's library."""
    logger.info(f"[Adv Research Service] Dispatching citation for user_id={user_id}")

    from app.services.agents.supervisor import dispatch
    data = await dispatch("citation", paper_ids=[], db=db, user_id=user_id)
    return CitationIntelligenceResponse(**data)


async def get_semantic_recommendations(
    db: AsyncSession, user_id: int
) -> List[dict]:
    """Recommend ArXiv papers based on the user's library titles."""
    from sqlalchemy import select
    from app.models.paper import Paper
    from app.services.arxiv_service import search_arxiv
    
    result = await db.execute(
        select(Paper.title)
        .where(Paper.user_id == user_id)
        .order_by(Paper.upload_date.desc())
        .limit(3)
    )
    titles = [row[0] for row in result.fetchall() if row[0]]
    
    if not titles:
        # Default fallback query if no papers
        return search_arxiv("artificial intelligence", max_results=10)
        
    # Build a simple semantic query from the latest titles
    words = " ".join(titles).split()
    
    # Clean words and filter out common short words to keep it broad
    import re
    cleaned_words = [re.sub(r'[^a-zA-Z]', '', w).lower() for w in words]
    keywords = list(set([w for w in cleaned_words if len(w) > 6]))
    
    # Use only 1 or 2 keywords to ensure we get plenty of results (broad search)
    query = " ".join(keywords[:2]) if keywords else "artificial intelligence"
    
    logger.info(f"[Adv Research Service] Recommending based on query: {query}")
    return search_arxiv(query, max_results=10)
