"""
Agents — Reviewer Agent
Acts as an aggressive "Reviewer 2" to critique a paper's methodology, novelty,
and citations. Generates a structured JSON response with scores and critiques.
"""

import json
import logging

from app.services.agents.tools import fetch_abstracts_async
from app.utils.exceptions import ServiceException
from app.utils.groq_client import call_groq_api_with_rotation

logger = logging.getLogger("app")

def _clean_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    start = clean.find("{")
    end = clean.rfind("}")
    if start != -1 and end != -1:
        return json.loads(clean[start:end + 1])
    raise json.JSONDecodeError("Could not find JSON structure", clean, 0)

async def run(paper_id: str, db) -> dict:
    """Run the Reviewer Agent on a paper."""
    logger.info(f"[Reviewer Agent] Reviewing paper {paper_id}")
    
    # We use abstract/summary as context, or ideally full text if available.
    # For now, fetch abstract tool works.
    context = await fetch_abstracts_async([paper_id], db)
    
    system_prompt = "You are 'Reviewer 2', a strict, critical, but fair academic peer reviewer."
    
    user_prompt = f"""Review the following paper draft or abstract. Provide a highly critical assessment.
Score it out of 10 on Novelty, Methodology, and Clarity.
Provide 3 major critiques and 2 missing areas/citations.

Return ONLY a valid JSON object with this exact structure:
{{
    "scores": {{
        "novelty": 7,
        "methodology": 5,
        "clarity": 8
    }},
    "critiques": [
        "Critique 1",
        "Critique 2",
        "Critique 3"
    ],
    "improvements": [
        "Improvement 1",
        "Improvement 2"
    ],
    "overall_decision": "Major Revision"
}}

Paper content:
{context}
"""

    raw = await call_groq_api_with_rotation(user_prompt, system_prompt, max_tokens=1000)
    try:
        return _clean_json(raw)
    except Exception as e:
        logger.error(f"[Reviewer Agent] Failed to parse JSON: {raw[:200]} - {e}")
        raise ServiceException("Failed to generate peer review.")
