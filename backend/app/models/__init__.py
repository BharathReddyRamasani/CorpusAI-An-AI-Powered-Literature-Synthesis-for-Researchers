"""
Models — Package Init: import all models so SQLAlchemy registers them.
"""

from app.models.user import User
from app.models.paper import Paper
from app.models.citation import Citation
from app.models.summary import Summary
from app.models.chat import ChatHistory
from app.models.report import Report
from app.models.advanced import (
    ResearchInsight,
    Flashcard,
    Quiz,
    LiteratureReview,
    ResearchGap,
    Visualization,
    SharedDashboard
)

__all__ = [
    "User", "Paper", "Citation", "Summary", "ChatHistory", "Report",
    "ResearchInsight", "Flashcard", "Quiz", "LiteratureReview", 
    "ResearchGap", "Visualization", "SharedDashboard"
]
