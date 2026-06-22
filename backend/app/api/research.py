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
    CitationIntelligenceResponse,
    ArxivImportRequest,
    WebSearchRequest,
    PeerReviewRequest,
    PeerReviewResponse,
    TranslateRequest,
    TranslateResponse,
    ShareDashboardRequest,
    ShareDashboardResponse
)
from app.schemas.paper import PaperUploadResponse
from app.services import advanced_research_service, arxiv_service, paper_service
from app.utils.dependencies import get_current_user, get_db
from fastapi import BackgroundTasks, status
import os

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
    "/web-search",
    response_model=GlobalChatResponse,
    summary="Live Web Search Agent",
)
async def live_web_search(
    payload: WebSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GlobalChatResponse:
    """Search the live web using duckduckgo and synthesize an answer."""
    from app.services.agents.web_agent import run
    res = await run(payload.question)
    
    if payload.paper_id:
        from app.services.rag_service import _store_chat
        await _store_chat(db, payload.paper_id, current_user.id, payload.question, res["answer"])
        
    return GlobalChatResponse(answer=res["answer"], sources=res["sources"])

@router.post(
    "/peer-review",
    response_model=PeerReviewResponse,
    summary="Reviewer 2 Mode",
)
async def generate_peer_review(
    payload: PeerReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PeerReviewResponse:
    """Generate an aggressive peer review for a specific paper."""
    from app.services.agents.reviewer_agent import run
    res = await run(payload.paper_id, db)
    return PeerReviewResponse(**res)

@router.post(
    "/translate",
    response_model=TranslateResponse,
    summary="Zero-Shot Cross-Lingual Translation",
)
async def translate_text(
    payload: TranslateRequest,
    current_user: User = Depends(get_current_user),
) -> TranslateResponse:
    """Translate text to the target language on the fly."""
    from app.utils.groq_client import call_groq_api_with_rotation
    system = f"You are a professional academic translator. Translate the given text to {payload.target_language}. Return ONLY the translated text."
    translated = await call_groq_api_with_rotation(payload.text, system)
    return TranslateResponse(translated_text=translated)

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


@router.post(
    "/podcast",
    summary="Generate Audio Podcast",
)
async def generate_podcast(
    payload: MultiPaperRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and return an MP3 podcast summarizing the papers."""
    from app.services import podcast_service
    from fastapi.responses import FileResponse
    
    file_path = await podcast_service.generate_podcast(db, payload.paper_ids, current_user.id)
    return FileResponse(path=file_path, media_type="audio/mpeg", filename=f"podcast_{payload.paper_ids[0]}.mp3")


@router.get(
    "/arxiv/search",
    summary="Search ArXiv API",
)
async def arxiv_search(
    q: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    """Search for external papers on ArXiv."""
    return arxiv_service.search_arxiv(q, max_results=limit)


@router.get(
    "/arxiv/recommendations",
    summary="Semantic ArXiv Recommendations",
)
async def arxiv_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recommendations based on local library."""
    return await advanced_research_service.get_semantic_recommendations(db, current_user.id)



@router.post(
    "/arxiv/import",
    response_model=PaperUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Import Paper from ArXiv",
)
async def import_arxiv_paper(
    payload: ArxivImportRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download PDF from ArXiv and import it into the local library."""
    # 1. Download PDF to temp file
    temp_path = arxiv_service.download_arxiv_pdf(payload.url, payload.title)
    
    # 2. Read content
    with open(temp_path, "rb") as f:
        content = f.read()
        
    # Clean up temp file
    os.remove(temp_path)

    # 3. Create paper record and save file
    paper = await paper_service.create_paper(
        db=db,
        user_id=current_user.id,
        filename=f"{payload.title[:30]}.pdf",
        file_content=content,
    )

    # 4. Trigger background processing pipeline
    from app.db.sqlite import AsyncSessionLocal

    async def run_pipeline(paper_id: str) -> None:
        async with AsyncSessionLocal() as bg_session:
            try:
                await paper_service.process_paper_pipeline(bg_session, paper_id)
                await bg_session.commit()
            except Exception as e:
                await bg_session.rollback()
                logger.error(f"Background pipeline failed for {paper_id}: {e}")

    background_tasks.add_task(run_pipeline, paper.paper_id)
    await db.commit()

    return PaperUploadResponse(
        message="ArXiv paper imported successfully. Processing has started.",
        paper_id=paper.paper_id,
        filename=paper.filename,
        status=paper.status,
    )


@router.post(
    "/share",
    response_model=ShareDashboardResponse,
    summary="Publish Dashboard Snapshot",
)
async def share_dashboard(
    payload: ShareDashboardRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a dashboard snapshot and return a shareable ID."""
    from app.models.advanced import SharedDashboard
    import uuid
    share_id = uuid.uuid4().hex
    new_share = SharedDashboard(
        id=share_id,
        user_id=current_user.id,
        snapshot_data=payload.snapshot_data,
    )
    db.add(new_share)
    await db.commit()
    return ShareDashboardResponse(share_id=share_id)


@router.get(
    "/share/{share_id}",
    summary="Get Published Dashboard Snapshot",
)
async def get_shared_dashboard(
    share_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a public dashboard snapshot."""
    from app.models.advanced import SharedDashboard
    from sqlalchemy.future import select
    from fastapi import HTTPException
    result = await db.execute(select(SharedDashboard).where(SharedDashboard.id == share_id))
    shared = result.scalars().first()
    if not shared:
        raise HTTPException(status_code=404, detail="Shared dashboard not found")
    return {"snapshot_data": shared.snapshot_data, "created_at": shared.created_at}
