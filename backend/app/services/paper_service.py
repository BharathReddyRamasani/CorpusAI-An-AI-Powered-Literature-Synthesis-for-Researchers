"""
Services — Paper Service
CRUD operations for papers, pagination, search, sort.
Repository pattern over SQLAlchemy async sessions.
"""

import asyncio
import concurrent.futures
import logging
import math
from pathlib import Path
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.chromadb import get_collection
from app.models.citation import Citation
from app.models.paper import Paper
from app.models.summary import Summary
from app.services import chunking_service, embedding_service
from app.services.citation_service import extract_citations
from app.services.pdf_service import extract_pdf
from app.utils.exceptions import NotFoundException, ServiceException
from app.utils.helpers import generate_paper_id, get_upload_path, sanitize_filename

logger = logging.getLogger("app")

# PERF: Dedicated thread pool for CPU-bound embedding work
# Keeps embedding from competing with LLM calls or event loop I/O
_EMBED_EXECUTOR = concurrent.futures.ThreadPoolExecutor(
    max_workers=2,
    thread_name_prefix="embed_worker"
)


# ── Create Paper Record ───────────────────────────────────────────────────────

async def create_paper(
    db: AsyncSession,
    user_id: int,
    filename: str,
    file_content: bytes,
) -> Paper:
    """
    Save the uploaded PDF and create a paper record in SQLite.
    Returns the Paper object with status='pending'.
    """
    paper_id = generate_paper_id()
    safe_filename = sanitize_filename(filename)
    file_path = get_upload_path(paper_id, safe_filename)

    # Ensure upload directory exists
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    # Write file to disk
    file_path.write_bytes(file_content)
    logger.info(f"PDF saved: {file_path}")

    paper = Paper(
        paper_id=paper_id,
        user_id=user_id,
        filename=safe_filename,
        file_path=str(file_path),
        status="pending",
    )
    db.add(paper)
    await db.flush()
    await db.refresh(paper)
    logger.info(f"Paper record created: paper_id={paper_id}")
    return paper


# ── Get Paper ─────────────────────────────────────────────────────────────────

async def get_paper_by_id(db: AsyncSession, paper_id: str) -> Paper:
    result = await db.execute(select(Paper).where(Paper.paper_id == paper_id))
    paper = result.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
    return paper


async def get_paper_by_id_and_user(
    db: AsyncSession, paper_id: str, user_id: int
) -> Paper:
    result = await db.execute(
        select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id)
    )
    paper = result.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
    return paper


# ── List Papers (paginated, search, sort) ────────────────────────────────────

async def list_papers(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    sort_by: str = "upload_date",
    sort_order: str = "desc",
) -> tuple[list[Paper], int]:
    """
    Return paginated papers for a user with optional search and sort.

    Returns:
        (papers_list, total_count)
    """
    from sqlalchemy.orm import defer

    # Base conditions
    base_where = [Paper.user_id == user_id]
    if search:
        base_where.append(
            or_(
                Paper.title.ilike(f"%{search}%"),
                Paper.filename.ilike(f"%{search}%"),
                Paper.authors.ilike(f"%{search}%"),
                Paper.abstract.ilike(f"%{search}%"),
            )
        )

    # Count total (optimized, without pulling the entire subquery)
    count_query = select(func.count(Paper.paper_id)).where(*base_where)
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()

    # Query papers (deferring full_text prevents huge memory loading and latency)
    query = select(Paper).options(defer(Paper.full_text)).where(*base_where)

    # Sort
    sort_col = getattr(Paper, sort_by, Paper.upload_date)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    papers = list(result.scalars().all())
    return papers, total


# ── Processing Pipeline ───────────────────────────────────────────────────────

async def process_paper_pipeline(db: AsyncSession, paper_id: str) -> None:
    """
    Full paper processing pipeline:
    1. Extract PDF text + sections
    2. Extract metadata (title, authors, abstract)
    3. Extract citations
    4. Chunk text
    5. Generate embeddings
    6. Store in ChromaDB

    This runs as a background task after upload.
    """
    logger.info(f"[Pipeline] Starting for paper_id={paper_id}")

    # Mark as processing
    paper = await get_paper_by_id(db, paper_id)
    paper.status = "processing"
    await db.flush()

    try:
        # Step 1 & 2: Document Extraction + Metadata
        logger.info(f"[Pipeline] Step 1/5: Extracting Document Content")
        from app.services.document_service import extract_content
        sections = await asyncio.to_thread(extract_content, paper.file_path, paper.filename)

        # PDF Highlight Extraction
        from app.services.pdf_service import extract_pdf_highlights
        highlights = await asyncio.to_thread(extract_pdf_highlights, paper.file_path)
        if highlights:
            # We add highlights as a special section to be chunked and embedded
            sections.other_sections["user_highlights"] = highlights
            logger.info(f"[Pipeline] Extracted {len(highlights)} characters of highlights.")

        paper.title = sections.title or paper.filename
        paper.authors = sections.authors or ""
        paper.abstract = sections.abstract or ""
        paper.full_text = sections.full_text
        await db.flush()

        # Step 3: Citation Extraction
        logger.info(f"[Pipeline] Step 2/5: Extracting citations")
        citations = await asyncio.to_thread(extract_citations, sections.references)
        for c in citations:
            citation_obj = Citation(
                paper_id=paper_id,
                author=c.author,
                year=c.year,
                title=c.title,
                raw_text=c.raw_text,
            )
            db.add(citation_obj)
        await db.flush()
        logger.info(f"[Pipeline] {len(citations)} citations stored.")

        # Step 4: Chunking
        logger.info(f"[Pipeline] Step 3/5: Chunking")
        sections_dict = sections.to_sections_dict()
        chunks = await asyncio.to_thread(chunking_service.chunk_sections, sections_dict)
        
        # PERF: Smart chunk cap — keep high-value sections first
        # 150 chunks ≈ 150k chars ≈ full paper for dense retrieval
        # Priority: abstract/intro/conclusion always kept, body sampled
        MAX_CHUNKS = 150
        if len(chunks) > MAX_CHUNKS:
            priority_sections = {"abstract", "introduction", "conclusion",
                                 "methodology", "results", "related_work"}
            priority = [c for c in chunks
                        if c.section_name.lower() in priority_sections]
            rest = [c for c in chunks
                    if c.section_name.lower() not in priority_sections]
            # Fill up to MAX_CHUNKS with remaining body chunks
            kept = priority + rest[: MAX_CHUNKS - len(priority)]
            logger.info(
                f"[Pipeline] Smart-capped {len(chunks)} → {len(kept)} chunks "
                f"({len(priority)} priority + {len(kept)-len(priority)} body)."
            )
            chunks = kept
            
        logger.info(f"[Pipeline] {len(chunks)} chunks generated.")

        # Step 5 & 6: Embeddings + ChromaDB
        logger.info(f"[Pipeline] Step 4/5: Generating embeddings and storing in ChromaDB")
        chunk_texts = [c.text for c in chunks]

        if chunk_texts:
            # PERF: Run embedding in dedicated embed executor (CPU-bound)
            # Never blocks LLM workers or the shared default executor
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                _EMBED_EXECUTOR, embedding_service.generate_embeddings_batch, chunk_texts
            )

            collection = get_collection()
            ids = [f"{paper_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "paper_id": paper_id,
                    "section_name": c.section_name,
                    "chunk_index": c.chunk_index,
                    "page_number": c.page_number or 0,
                }
                for c in chunks
            ]

            # Store in ChromaDB (batch upsert)
            collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=chunk_texts,
                metadatas=metadatas,
            )
            logger.info(f"[Pipeline] {len(chunks)} chunks stored in ChromaDB.")

        # Mark as ready
        paper.status = "ready"
        await db.flush()
        logger.info(f"[Pipeline] COMPLETE for paper_id={paper_id}")

    except Exception as e:
        logger.error(f"[Pipeline] FAILED for paper_id={paper_id}: {e}", exc_info=True)
        paper.status = "failed"
        await db.flush()
        # DO NOT raise here. If we raise, the parent background task rolls back the transaction,
        # which reverts paper.status back to 'pending', causing infinite UI polling!
