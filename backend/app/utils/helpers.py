"""
Utils — Helper Functions (file validation, UUID generation, path helpers)
"""

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings
from app.utils.exceptions import BadRequestException


# ── UUID ──────────────────────────────────────────────────────────────────────

def generate_paper_id() -> str:
    """Generate a unique paper ID."""
    return str(uuid.uuid4()).replace("-", "")[:16]


def generate_uuid() -> str:
    return str(uuid.uuid4())


# ── File Validation ───────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream", # Fallback for unknown mime types from OS
    "application/vnd.ms-excel", # Excel CSVs
}
ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".md", ".csv", ".docx"
}
MAX_FILE_SIZE_BYTES = settings.max_file_size_mb * 1024 * 1024


def validate_supported_file(file: UploadFile) -> None:
    """Validate uploaded file is a supported type within size limits."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise BadRequestException(
            f"Invalid file type '{ext}'. Supported types are: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise BadRequestException(
            f"Invalid content type '{file.content_type}'."
        )


async def validate_file_size(file: UploadFile) -> bytes:
    """Read file content and validate it doesn't exceed max size."""
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise BadRequestException(
            f"File size exceeds the maximum allowed size of {settings.max_file_size_mb} MB."
        )
    return content


# ── Path Helpers ──────────────────────────────────────────────────────────────

def ensure_directories() -> None:
    """Ensure required storage directories exist."""
    dirs = [
        settings.upload_dir,
        settings.reports_dir,
        settings.chroma_persist_dir,
        Path(settings.log_file).parent,
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)


def get_upload_path(paper_id: str, filename: str) -> Path:
    """Return the full path for storing an uploaded PDF."""
    return Path(settings.upload_dir) / f"{paper_id}_{filename}"


def get_report_path(paper_id: str, fmt: str) -> Path:
    """Return the full path for a generated report."""
    return Path(settings.reports_dir) / f"report_{paper_id}.{fmt}"


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename."""
    if not filename:
        return "untitled"
    return os.path.basename(filename).replace("..", "")
