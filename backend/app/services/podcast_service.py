"""
Services — Podcast Service
Uses edge-tts to generate audio from text locally without API keys.
"""

import os
import logging
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.paper import Paper
from app.services.agents.tools import get_llm_with_rotation

logger = logging.getLogger("app")

async def generate_podcast(db: AsyncSession, paper_ids: list[str], user_id: int) -> str:
    """
    Generate an MP3 podcast summarizing the provided papers.
    Returns the absolute path to the generated MP3 file.
    """
    logger.info(f"[Podcast Service] Generating podcast for {len(paper_ids)} papers.")
    
    # 1. Fetch papers
    result = await db.execute(
        select(Paper).where(Paper.paper_id.in_(paper_ids), Paper.user_id == user_id)
    )
    papers = result.scalars().all()
    if not papers:
        raise ValueError("No papers found.")
        
    # 2. Extract content
    context = ""
    for i, p in enumerate(papers):
        title = p.title or p.filename
        abstract = p.abstract or "No abstract available."
        context += f"Paper {i+1}: {title}\nAbstract: {abstract}\n\n"
        
    # 3. Generate script using LLM
    prompt = f"""You are the host of a research podcast. 
Write a short, engaging, 1-minute podcast script summarizing the following research papers.
The script should be conversational, enthusiastic, and easy to listen to.
Do NOT include any speaker labels or stage directions (like 'Host:' or '[Music fades in]').
Just output the raw text exactly as it should be spoken.

Papers:
{context}
"""
    llm = get_llm_with_rotation()
    try:
        response = await llm.ainvoke(prompt)
        script = response.content
    except Exception as e:
        logger.error(f"Failed to generate podcast script: {e}")
        script = "Welcome to the podcast. Unfortunately, I was unable to generate a summary for your selected papers at this time."

    # 4. Generate audio using edge-tts
    output_dir = Path("uploads/podcasts")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_filename = f"podcast_{paper_ids[0]}.mp3"
    output_path = output_dir / output_filename
    
    # Use a nice conversational voice (e.g., en-US-AriaNeural or en-US-ChristopherNeural)
    voice = "en-US-AriaNeural"
    
    logger.info(f"[Podcast Service] Generating audio to {output_path}")
    
    import subprocess
    
    # Run edge-tts in a separate thread to avoid blocking the event loop
    # and to bypass Windows asyncio subprocess limitations in Uvicorn
    def run_tts():
        return subprocess.run(
            ["edge-tts", "--voice", voice, "--text", script, "--write-media", str(output_path)],
            capture_output=True,
            text=True
        )
        
    process = await asyncio.to_thread(run_tts)
    
    if process.returncode != 0:
        error_msg = process.stderr
        logger.error(f"edge-tts failed: {error_msg}")
        raise Exception(f"TTS Generation failed: {error_msg}")
        
    logger.info("[Podcast Service] Audio generation complete.")
    return str(output_path)
