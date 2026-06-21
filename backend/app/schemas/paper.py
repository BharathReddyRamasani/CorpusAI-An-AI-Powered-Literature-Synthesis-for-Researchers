"""
Schemas — Paper Pydantic Models
"""

from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, Field, field_validator, HttpUrl


# ── Paper Response ────────────────────────────────────────────────────────────

class PaperResponse(BaseModel):
    paper_id: str
    user_id: int
    filename: str
    title: Optional[str] = None
    authors: Optional[str] = None
    abstract: Optional[str] = None
    status: str
    upload_date: datetime

    @field_validator("upload_date", mode="before")
    @classmethod
    def parse_sqlite_datetime(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                if "." in v:
                    return datetime.strptime(v, "%Y-%m-%d %H:%M:%S.%f")
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                pass
        return v

    model_config = {"from_attributes": True}


class PaperDetailResponse(PaperResponse):
    full_text: Optional[str] = None


class PaperUploadResponse(BaseModel):
    success: bool = True
    message: str
    paper_id: str
    filename: str
    status: str


class URLUploadRequest(BaseModel):
    url: HttpUrl


# ── Citation Schemas ──────────────────────────────────────────────────────────

class CitationResponse(BaseModel):
    id: int
    paper_id: str
    author: Optional[str] = None
    year: Optional[str] = None
    title: Optional[str] = None
    raw_text: Optional[str] = None

    model_config = {"from_attributes": True}


class CitationsListResponse(BaseModel):
    success: bool = True
    paper_id: str
    total_citations: int
    citations: list[CitationResponse]


# ── Summary Schemas ───────────────────────────────────────────────────────────

class SummaryResponse(BaseModel):
    id: int
    paper_id: str
    summary: str
    created_at: datetime

    @field_validator("created_at", mode="before")
    @classmethod
    def parse_sqlite_datetime(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                if "." in v:
                    return datetime.strptime(v, "%Y-%m-%d %H:%M:%S.%f")
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                pass
        return v

    model_config = {"from_attributes": True}


class SummaryAPIResponse(BaseModel):
    success: bool = True
    paper_id: str
    summary: SummaryResponse


# ── Papers List (Paginated) ───────────────────────────────────────────────────

class PapersListResponse(BaseModel):
    success: bool = True
    total: int
    page: int
    page_size: int
    total_pages: int
    papers: list[PaperResponse]
