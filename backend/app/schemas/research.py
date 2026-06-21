from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class MultiPaperRequest(BaseModel):
    paper_ids: List[str] = Field(..., min_length=1, max_length=10)


class GlobalChatRequest(MultiPaperRequest):
    question: str


class GlobalChatResponse(BaseModel):
    answer: str
    sources: List[str]


class AnalysisResponse(BaseModel):
    common_models: List[str]
    common_datasets: List[str]
    research_trends: List[str]


class ComparisonResponse(BaseModel):
    papers: List[str]
    comparison: Dict[str, Dict[str, str]]


class SectionChatRequest(BaseModel):
    paper_id: str
    section: str
    question: str


class GapResponse(BaseModel):
    gap: str
    reason: str


class GapsListResponse(BaseModel):
    gaps: List[GapResponse]


class InsightResponse(BaseModel):
    contributions: List[str]
    novel_ideas: List[str]
    key_findings: List[str]
    limitations: List[str]


class LiteratureReviewResponse(BaseModel):
    introduction: str
    existing_methods: str
    challenges: str
    future_directions: str
    conclusion: str


class CitationIntelligenceResponse(BaseModel):
    top_papers: List[str]
    top_models: List[str]
    top_datasets: List[str]


class FlashcardResponse(BaseModel):
    question: str
    answer: str


class QuizOption(BaseModel):
    text: str


class QuizResponse(BaseModel):
    question: str
    options: List[str]
    answer: str


class ChartData(BaseModel):
    title: str
    type: str
    labels: List[str]
    values: List[float]


class VisualizationResponse(BaseModel):
    charts: List[ChartData]


class ArxivImportRequest(BaseModel):
    url: str
    title: str

class WebSearchRequest(BaseModel):
    question: str

class PeerReviewRequest(BaseModel):
    paper_id: str

class PeerReviewScores(BaseModel):
    novelty: int
    methodology: int
    clarity: int

class PeerReviewResponse(BaseModel):
    scores: PeerReviewScores
    critiques: List[str]
    improvements: List[str]
    overall_decision: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class TranslateResponse(BaseModel):
    translated_text: str

class ShareDashboardRequest(BaseModel):
    snapshot_data: Dict[str, Any]

class ShareDashboardResponse(BaseModel):
    share_id: str
