"""
API — Advanced Research Routes
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.research import (
    AnalysisResponse,
    ComparisonResponse,
    GlobalChatRequest,
    GlobalChatResponse,
    GapsListResponse,
    LiteratureReviewResponse,
    MultiPaperRequest,
    CitationIntelligenceResponse
)
from app.services import advanced_research_service
from app.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/api/research", tags=["Advanced Research"])
logger = logging.getLogger("app")


@router.post(
    "/global-chat",
    response_model=GlobalChatResponse,
    summary="Cross-Document RAG",
)
async def global_chat(
    payload: GlobalChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GlobalChatResponse:
    """Ask questions across multiple uploaded research papers simultaneously."""
    return await advanced_research_service.global_chat(
        paper_ids=payload.paper_ids,
        user_id=current_user.id,
        question=payload.question,
    )


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Multi-Paper Analysis",
)
async def multi_paper_analysis(
    payload: MultiPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisResponse:
    """Analyze multiple uploaded papers together."""
    return await advanced_research_service.multi_paper_analysis(
        db=db,
        paper_ids=payload.paper_ids,
        user_id=current_user.id,
    )


@router.post(
    "/compare",
    response_model=ComparisonResponse,
    summary="Paper Comparison Engine",
)
async def compare_papers(
    payload: MultiPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ComparisonResponse:
    """Generate comparison tables automatically."""
    return await advanced_research_service.compare_papers(
        db=db,
        paper_ids=payload.paper_ids,
        user_id=current_user.id,
    )


@router.post(
    "/gaps",
    response_model=GapsListResponse,
    summary="Research Gap Detection",
)
async def detect_gaps(
    payload: MultiPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GapsListResponse:
    """Identify potential research opportunities from multiple papers."""
    return await advanced_research_service.detect_gaps(
        db=db,
        paper_ids=payload.paper_ids,
        user_id=current_user.id,
    )


@router.post(
    "/literature-review",
    response_model=LiteratureReviewResponse,
    summary="Literature Review Generator",
)
async def generate_literature_review(
    payload: MultiPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LiteratureReviewResponse:
    """Generate mini literature reviews automatically."""
    return await advanced_research_service.generate_literature_review(
        db=db,
        paper_ids=payload.paper_ids,
        user_id=current_user.id,
    )


@router.get(
    "/citation-intelligence",
    response_model=CitationIntelligenceResponse,
    summary="Citation Intelligence",
)
async def get_citation_intelligence(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CitationIntelligenceResponse:
    """Analyze most referenced papers, models, and datasets."""
    return await advanced_research_service.get_citation_intelligence(
        db=db,
        user_id=current_user.id,
    )
