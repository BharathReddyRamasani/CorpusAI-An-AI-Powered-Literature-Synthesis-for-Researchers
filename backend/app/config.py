"""
AI Research Assistant — Centralized Configuration
Uses pydantic-settings to load from environment variables / .env file.
"""

from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "Corpus AI"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    allowed_origins: str = "http://localhost:5173,http://localhost:7860"

    # ── Security ─────────────────────────────────────────────────────────────
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # ── Groq ──────────────────────────────────────────────────────────────────
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    # ── SQLite ────────────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./.data/research_assistant.db"

    # ── ChromaDB ─────────────────────────────────────────────────────────────
    chroma_persist_dir: str = "./.data/chroma_db"
    chroma_collection_name: str = "research_papers"

    # ── Embeddings ────────────────────────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"

    # ── File Storage ─────────────────────────────────────────────────────────
    upload_dir: str = "./.data/uploads"
    reports_dir: str = "./.data/reports"
    max_file_size_mb: int = 50

    # ── Chunking ─────────────────────────────────────────────────────────────
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # ── RAG ──────────────────────────────────────────────────────────────────
    rag_top_k: int = 5

    # ── Logging ──────────────────────────────────────────────────────────────
    log_level: str = "INFO"
    log_file: str = "./.data/logs/app.log"
    
    # ── SMTP Email ───────────────────────────────────────────────────────────
    smtp_email: str = ""
    smtp_password: str = ""

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32 or v == "change-me-in-production":
            raise ValueError("SECRET_KEY must be at least 32 characters long and not the default.")
        return v

    @property
    def groq_keys_list(self) -> list[str]:
        keys = [k.strip() for k in self.groq_api_key.split(",") if k.strip()]
        if not keys:
            raise ValueError("At least one GROQ_API_KEY must be provided.")
        return keys

    @property
    def cors_origins_list(self) -> list[str]:
        return [k.strip() for k in self.allowed_origins.split(",") if k.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
