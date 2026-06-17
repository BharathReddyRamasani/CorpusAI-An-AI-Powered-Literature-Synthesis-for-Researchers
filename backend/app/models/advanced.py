"""
Models — Advanced Research Features
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func, JSON

from app.db.sqlite import Base


class ResearchInsight(Base):
    __tablename__ = "research_insights"

    id: int = Column(Integer, primary_key=True, index=True)
    paper_id: str = Column(String(64), ForeignKey("papers.paper_id"), nullable=False, index=True, unique=True)
    contributions: str = Column(JSON, nullable=True) # List of strings
    novel_ideas: str = Column(JSON, nullable=True)
    key_findings: str = Column(JSON, nullable=True)
    limitations: str = Column(JSON, nullable=True)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: int = Column(Integer, primary_key=True, index=True)
    paper_id: str = Column(String(64), ForeignKey("papers.paper_id"), nullable=False, index=True)
    question: str = Column(Text, nullable=False)
    answer: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)


class Quiz(Base):
    __tablename__ = "quizzes"

    id: int = Column(Integer, primary_key=True, index=True)
    paper_id: str = Column(String(64), ForeignKey("papers.paper_id"), nullable=False, index=True)
    question: str = Column(Text, nullable=False)
    options: str = Column(JSON, nullable=False) # List of strings
    answer: str = Column(String(512), nullable=False)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)


class LiteratureReview(Base):
    __tablename__ = "literature_reviews"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_ids: str = Column(JSON, nullable=False) # List of strings
    content: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)


class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    paper_ids: str = Column(JSON, nullable=False) # List of strings
    gap: str = Column(Text, nullable=False)
    reason: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)

class Visualization(Base):
    __tablename__ = "visualizations"
    
    id: int = Column(Integer, primary_key=True, index=True)
    paper_id: str = Column(String(64), ForeignKey("papers.paper_id"), nullable=False, index=True, unique=True)
    charts_data: str = Column(JSON, nullable=False) # List of chart objects
    created_at: datetime = Column(DateTime, server_default=func.now(), nullable=False)
