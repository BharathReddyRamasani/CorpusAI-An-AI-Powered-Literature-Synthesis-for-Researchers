"""
Services — Audio Service
Uses Groq's whisper-large-v3 to transcribe audio files.
"""

import logging
from pathlib import Path
import httpx

from app.services.pdf_service import PaperSections
from app.config import settings
from app.utils.exceptions import ServiceException

logger = logging.getLogger("app")


def extract_audio(file_path: Path) -> PaperSections:
    """
    Transcribe audio file using Groq Whisper API.
    """
    logger.info(f"Extracting audio using Groq: {file_path.name}")
    
    if not hasattr(settings, "groq_api_key") or not settings.groq_api_key:
        raise ServiceException("No GROQ_API_KEY configured. Please add it to your .env file.")
        
    try:
        api_key = settings.groq_api_key
        url = "https://api.groq.com/openai/v1/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        
        logger.info(f"Uploading audio file to Groq Whisper API: {file_path.name}")
        
        with open(file_path, "rb") as file:
            files = {
                "file": (file_path.name, file, "audio/mpeg")
            }
            data = {
                "model": "whisper-large-v3",
                "response_format": "json"
            }
            
            with httpx.Client(timeout=120.0) as client:
                response = client.post(url, headers=headers, data=data, files=files)
                response.raise_for_status()
                
        transcription_data = response.json()
        full_text = transcription_data.get("text", "")
        
        result = PaperSections(
            full_text=full_text,
            title=file_path.name,
            abstract=full_text[:1000] if len(full_text) > 1000 else full_text
        )
        return result
        
    except Exception as e:
        logger.error(f"Groq Audio extraction failed for {file_path.name}: {e}")
        raise ServiceException(f"Audio transcription failed: {e}")
