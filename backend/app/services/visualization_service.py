"""
Services — Visualization & Insights Extraction
"""

import json
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.advanced import ResearchInsight, Visualization
from app.models.paper import Paper
from app.schemas.research import InsightResponse, VisualizationResponse
from app.utils.exceptions import NotFoundException, ServiceException
from app.utils.gemini import call_gemini_api_with_rotation

logger = logging.getLogger("app")


async def get_insights(db: AsyncSession, paper_id: str, user_id: int) -> InsightResponse:
    # Check if already generated
    result = await db.execute(select(ResearchInsight).where(ResearchInsight.paper_id == paper_id))
    existing = result.scalar_one_or_none()
    if existing:
        return InsightResponse(
            contributions=json.loads(existing.contributions or "[]"),
            novel_ideas=json.loads(existing.novel_ideas or "[]"),
            key_findings=json.loads(existing.key_findings or "[]"),
            limitations=json.loads(existing.limitations or "[]")
        )

    # Fetch paper
    paper_res = await db.execute(select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id))
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
        
    system_prompt = "You are an expert AI research assistant. Return ONLY valid JSON."
    prompt = f"""Analyze the research paper and identify:
- Key Contributions
- Novel Ideas
- Major Findings
- Limitations

Return the result STRICTLY as a JSON object with this exact structure:
{{
    "contributions": ["..."],
    "novel_ideas": ["..."],
    "key_findings": ["..."],
    "limitations": ["..."]
}}

Paper Title: {paper.title}
Abstract: {paper.abstract}
Full Text (partial): {paper.full_text[:15000] if paper.full_text else ""}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        insight = ResearchInsight(
            paper_id=paper_id,
            contributions=json.dumps(data.get("contributions", [])),
            novel_ideas=json.dumps(data.get("novel_ideas", [])),
            key_findings=json.dumps(data.get("key_findings", [])),
            limitations=json.dumps(data.get("limitations", []))
        )
        db.add(insight)
        await db.flush()
        
        return InsightResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for insights: {response_text}")
        raise ServiceException("Failed to generate research insights.")


async def get_visualizations(db: AsyncSession, paper_id: str, user_id: int) -> VisualizationResponse:
    # Check if already generated
    result = await db.execute(select(Visualization).where(Visualization.paper_id == paper_id))
    existing = result.scalar_one_or_none()
    if existing:
        charts_data = json.loads(existing.charts_data)
        return VisualizationResponse(charts=charts_data)

    # Fetch paper
    paper_res = await db.execute(select(Paper).where(Paper.paper_id == paper_id, Paper.user_id == user_id))
    paper = paper_res.scalar_one_or_none()
    if not paper:
        raise NotFoundException("Paper")
        
    system_prompt = "You are a data visualization expert. Return ONLY valid JSON."
    prompt = f"""Extract all measurable numerical findings from this paper (e.g., accuracy comparisons, dataset distributions, performance metrics).
Generate chart-ready data for React Recharts.

Return the result STRICTLY as a JSON object with this exact structure:
{{
    "charts": [
        {{
            "title": "Model Accuracy Comparison",
            "type": "bar",
            "labels": ["BERT", "RoBERTa", "CLIP"],
            "values": [90.5, 92.1, 95.3]
        }}
    ]
}}
Note: "type" must be one of: "bar", "line", "pie". If no numerical data is found, return an empty "charts" array.

Paper Title: {paper.title}
Abstract: {paper.abstract}
Results Section: {paper.full_text[:15000] if paper.full_text else ""}
"""

    response_text = await call_gemini_api_with_rotation(prompt, system_prompt)
    try:
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        vis = Visualization(
            paper_id=paper_id,
            charts_data=json.dumps(data.get("charts", []))
        )
        db.add(vis)
        await db.flush()
        
        return VisualizationResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse JSON for visualizations: {response_text}")
        # If extraction fails, gracefully return empty charts instead of failing the page load
        return VisualizationResponse(charts=[])
