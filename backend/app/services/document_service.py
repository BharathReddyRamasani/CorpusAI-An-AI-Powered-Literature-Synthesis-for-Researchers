"""
Services — Document Service
Routes files to the appropriate extractor based on their file extension.
"""

import logging
from pathlib import Path
from typing import Optional
import csv

from app.services.pdf_service import PaperSections, extract_pdf
from app.utils.exceptions import BadRequestException

logger = logging.getLogger("app")


def extract_docx(file_path: Path) -> PaperSections:
    """Extract text from Word Document using python-docx."""
    import docx
    
    doc = docx.Document(file_path)
    full_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    
    result = PaperSections(
        full_text=full_text,
        title=file_path.name,
        abstract=full_text[:1000] # Simple fallback
    )
    return result


def extract_text(file_path: Path) -> PaperSections:
    """Extract text from .txt and .md files."""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        full_text = f.read()
    
    result = PaperSections(
        full_text=full_text,
        title=file_path.name,
        abstract=full_text[:1000]
    )
    return result


def extract_csv(file_path: Path) -> PaperSections:
    """Extract text from .csv files."""
    full_text = ""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        for row in reader:
            full_text += " | ".join(row) + "\n"
            
    result = PaperSections(
        full_text=full_text,
        title=file_path.name,
        abstract="Data from CSV file."
    )
    return result


def extract_content(file_path: str | Path, filename: str) -> PaperSections:
    """
    Route the file to the appropriate extractor based on extension.
    Returns a PaperSections object.
    """
    file_path = Path(file_path)
    ext = file_path.suffix.lower()
    
    logger.info(f"Extracting content for {filename} with extension {ext}")
    
    if ext == ".pdf":
        return extract_pdf(file_path)
        
    elif ext == ".docx":
        return extract_docx(file_path)
        
    elif ext in {".txt", ".md"}:
        return extract_text(file_path)
        
    elif ext == ".csv":
        return extract_csv(file_path)
        
    else:
        raise BadRequestException(f"Unsupported file extension: {ext}")
