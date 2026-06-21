"""
Services — OCR Service
Uses EasyOCR to extract text locally since Groq Vision models are no longer supported on the free tier.
"""

import logging
from pathlib import Path
import easyocr

from app.services.pdf_service import PaperSections
from app.utils.exceptions import ServiceException

logger = logging.getLogger("app")

# Initialize the EasyOCR reader globally so it only loads into memory once
# 'en' specifies English. You can add more languages to the list if needed.
_READER = None

def get_reader():
    global _READER
    if _READER is None:
        logger.info("Initializing EasyOCR reader (this may take a moment to download models on first run)...")
        # gpu=False can be used if no CUDA is available, but EasyOCR auto-detects.
        _READER = easyocr.Reader(['en'])
    return _READER

def extract_image(file_path: Path) -> PaperSections:
    """
    Extract text from an image using local EasyOCR.
    """
    logger.info(f"Extracting OCR using local EasyOCR: {file_path.name}")
    
    try:
        reader = get_reader()
        # detail=0 returns only the text strings, not the bounding boxes
        results = reader.readtext(str(file_path), detail=0)
        
        full_text = "\n".join(results)
        
        if not full_text.strip():
            logger.warning(f"No text found in image: {file_path.name}")
            full_text = "No readable text detected in this image."
            
        result = PaperSections(
            full_text=full_text,
            title=file_path.name,
            abstract=full_text[:1000] if len(full_text) > 1000 else full_text
        )
        return result
        
    except Exception as e:
        logger.error(f"OCR extraction failed for {file_path.name}: {e}", exc_info=True)
        raise ServiceException(f"Image processing failed: {e}")
