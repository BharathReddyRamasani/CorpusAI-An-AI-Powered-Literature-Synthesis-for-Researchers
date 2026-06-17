"""
Services — Advanced Research Features
"""

import json
import logging
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.chromadb import get_collection
from app.models.advanced import LiteratureReview, ResearchGap
from app.models.citation import Citation
from app.models.paper import Paper
from app.prompts.qa import QA_SYSTEM_PROMPT
from app.schemas.research import (
    AnalysisResponse,
    ComparisonResponse,
    GlobalChatResponse,
    GapsListResponse,
    LiteratureReviewResponse,
    CitationIntelligenceResponse
)
from app.services import embedding_service
from app.utils.exceptions import NotFoundException, ServiceException
from app.utils.gemini import call_gemini_api_with_rotation

logger = logging.getLogger("app")


async def get_papers_by_ids(db: AsyncSession, paper_ids: List[str], user_id: int) -> List[Paper]:
    result = await db.execute(
        select(Paper).where(Paper.paper_id.in_(paper_ids), Paper.user_id == user_id)
    )
    papers = list(result.scalars().all())
    if not papers:
        raise NotFoundException("Papers")
    return papers


async def global_chat(
    paper_ids: List[str], user_id: int, question: str
) -> GlobalChatResponse:
    """Cross-Document RAG over specified papers."""
    
    # 1. Embed question
    import asyncio
    loop = asyncio.get_event_loop()
    question_embedding = await loop.run_in_executor(
        None, embedding_service.generate_embedding, question
    )

    # 2. Query ChromaDB with $in filter
    collection = get_collection()
    search_results = collection.query(
        query_embeddings=[question_embedding],
        n_results=10, # Top 10 chunks across all selected papers
        where={"paper_id": {"$in": paper_ids}},
    )

    retrieved_docs: List[str] = search_results.get("documents", [[]])[0]
    retrieved_meta: List[dict] = search_results.get("metadatas", [[]])[0]

    if not retrieved_docs:
        return GlobalChatResponse(answer="Information not found in selected papers.", sources=[])

    # 3. Build context
    context_parts = []
    for doc, meta in zip(retrieved_docs, retrieved_meta):
        paper_id = meta.get("paper_id", "unknown")
        section = meta.get("section_name", "unknown")
        context_parts.append(f"[Paper: {paper_id} | Section: {section}]\n{doc}")
    
    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""You are an AI Research Assistant performing cross-document analysis.
Answer the following question based ONLY on the provided context chunks from multiple research papers.
Compare and contrast where appropriate.

Context:
{context}

Question: {question}

Answer:"""

    answer = await call_gemini_api_with_rotation(prompt, QA_SYSTEM_PROMPT)
    
    source_snippets = [doc[:200] + "..." if len(doc) > 200 else doc for doc in retrieved_docs]
    
    return GlobalChatResponse(answer=answer, sources=source_snippets)


async def multi_paper_analysis(db: AsyncSession, paper_ids: List[str], user_id: int) -> AnalysisResponse:
    papers = await get_papers_by_ids(db, paper_ids, user_id)
    
    context_parts = []
    for p in papers:
        context_parts.append(f"Title: {p.title}\nAbstract: {p.abstract}")
    context = "\n\n".join(context_parts)
    
    system_prompt = "You are an expert AI research assistant. Return ONLY valid JSON."
    prompt = f"""Analyze the following research papers and identify common models, common datasets, and research trends.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "common_models": ["model1", "model2"],
    "common_datasets": ["dataset1", "dataset2"],
    "research_trends": ["trend1", "trend2"]
}}

Papers:
{context}
"""
    
    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        # Find JSON boundaries
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
        else:
            json_str = response_text
        data = json.loads(json_str)
        return AnalysisResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for multi_paper_analysis: {response_text}")
        raise ServiceException("Failed to generate multi-paper analysis.")


async def compare_papers(db: AsyncSession, paper_ids: List[str], user_id: int) -> ComparisonResponse:
    papers = await get_papers_by_ids(db, paper_ids, user_id)
    
    context_parts = []
    for p in papers:
        context_parts.append(f"Paper ID: {p.paper_id}\nTitle: {p.title}\nAbstract: {p.abstract}")
    context = "\n\n".join(context_parts)
    
    system_prompt = "You are an expert AI research assistant. Return ONLY valid JSON."
    prompt = f"""Compare the following research papers based on: dataset, model, accuracy, methodology, limitations.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "papers": ["Paper ID 1", "Paper ID 2"],
    "comparison": {{
        "dataset": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "model": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "accuracy": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "methodology": {{"Paper ID 1": "...", "Paper ID 2": "..."}},
        "limitations": {{"Paper ID 1": "...", "Paper ID 2": "..."}}
    }}
}}

Papers:
{context}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
        else:
            json_str = response_text
        data = json.loads(json_str)
        return ComparisonResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for compare_papers: {response_text}")
        raise ServiceException("Failed to generate paper comparison.")


async def detect_gaps(db: AsyncSession, paper_ids: List[str], user_id: int) -> GapsListResponse:
    papers = await get_papers_by_ids(db, paper_ids, user_id)
    
    context_parts = []
    for p in papers:
        context_parts.append(f"Title: {p.title}\nAbstract: {p.abstract}")
    context = "\n\n".join(context_parts)
    
    system_prompt = "You are an expert AI research assistant. Return ONLY valid JSON."
    prompt = f"""Analyze the limitations and future work of the following research papers.
Identify 3-5 potential research gaps or opportunities (e.g., underexplored areas, missing datasets, languages, or methodologies).
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "gaps": [
        {{"gap": "Short title of the gap", "reason": "Detailed explanation of why this is a gap based on the papers"}}
    ]
}}

Papers:
{context}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        # Save to DB
        for g in data.get("gaps", []):
            gap_record = ResearchGap(
                user_id=user_id,
                paper_ids=json.dumps(paper_ids),
                gap=g["gap"],
                reason=g["reason"]
            )
            db.add(gap_record)
        await db.flush()
        
        return GapsListResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for detect_gaps: {response_text}")
        raise ServiceException("Failed to generate research gaps.")


async def generate_literature_review(db: AsyncSession, paper_ids: List[str], user_id: int) -> LiteratureReviewResponse:
    papers = await get_papers_by_ids(db, paper_ids, user_id)
    
    context_parts = []
    for p in papers:
        context_parts.append(f"Title: {p.title}\nAbstract: {p.abstract}")
    context = "\n\n".join(context_parts)
    
    system_prompt = "You are an expert academic writer. Return ONLY valid JSON."
    prompt = f"""Generate a mini literature review based on the following research papers.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "introduction": "...",
    "existing_methods": "...",
    "challenges": "...",
    "future_directions": "...",
    "conclusion": "..."
}}

Papers:
{context}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        # Save to DB
        content_md = f"# Literature Review\n\n## Introduction\n{data['introduction']}\n\n## Existing Methods\n{data['existing_methods']}\n\n## Challenges\n{data['challenges']}\n\n## Future Directions\n{data['future_directions']}\n\n## Conclusion\n{data['conclusion']}"
        
        review_record = LiteratureReview(
            user_id=user_id,
            paper_ids=json.dumps(paper_ids),
            content=content_md
        )
        db.add(review_record)
        await db.flush()
        
        return LiteratureReviewResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for generate_literature_review: {response_text}")
        raise ServiceException("Failed to generate literature review.")


async def get_citation_intelligence(db: AsyncSession, user_id: int) -> CitationIntelligenceResponse:
    # Get all papers for user
    result = await db.execute(select(Paper.paper_id).where(Paper.user_id == user_id))
    paper_ids = [r for r in result.scalars().all()]
    
    if not paper_ids:
        return CitationIntelligenceResponse(top_papers=[], top_models=[], top_datasets=[])
        
    # Get all citations
    cit_result = await db.execute(select(Citation.raw_text).where(Citation.paper_id.in_(paper_ids)))
    citations = [r for r in cit_result.scalars().all()]
    
    if not citations:
        return CitationIntelligenceResponse(top_papers=[], top_models=[], top_datasets=[])
        
    # Pick a random sample of citations if there are too many to fit in prompt
    import random
    if len(citations) > 50:
        citations = random.sample(citations, 50)
        
    context = "\n".join(citations)
    
    system_prompt = "You are an expert AI research assistant. Return ONLY valid JSON."
    prompt = f"""Analyze the following list of citations extracted from a user's library of research papers.
Identify the most frequently referenced papers, models, and datasets.
Return the result STRICTLY as a JSON object with this exact structure:
{{
    "top_papers": ["paper title 1", "paper title 2"],
    "top_models": ["model1", "model2"],
    "top_datasets": ["dataset1", "dataset2"]
}}

Citations:
{context}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx+1]
        else:
            json_str = response_text
        data = json.loads(json_str)
        return CitationIntelligenceResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for get_citation_intelligence: {response_text}")
        raise ServiceException("Failed to generate citation intelligence.")
