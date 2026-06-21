"""
Models — Chat History ORM Model
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.sqlite import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: int = Column(Integer, primary_key=True, autoincrement=True, index=True)
    paper_id: str = Column(String(64), ForeignKey("papers.paper_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question: str = Column(Text, nullable=False)
    answer: str = Column(Text, nullable=False)
    timestamp: datetime = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<ChatHistory id={self.id} paper_id={self.paper_id}>"
