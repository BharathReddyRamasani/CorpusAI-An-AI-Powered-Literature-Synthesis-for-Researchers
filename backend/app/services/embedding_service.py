"""
Services — Embedding Service
Wraps BAAI/bge-small-en-v1.5 via Sentence Transformers.
Singleton pattern to load the model once at startup.
"""

import logging
import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from typing import Optional

from app.config import settings

logger = logging.getLogger("app")

_model = None


def _get_model():
    """Lazily load and cache the embedding model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {settings.embedding_model}")
            _model = SentenceTransformer(settings.embedding_model)
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    return _model


def generate_embedding(text: str) -> list[float]:
    """
    Generate a single embedding vector for the given text.

    Args:
        text: Input text to embed.

    Returns:
        List of floats representing the embedding vector.
    
    PERFORMANCE: Passes text as a list to go through the same optimized
    batch encode path as generate_embeddings_batch().
    """
    model = _get_model()
    # Use list input to hit the same optimized batch path as bulk embedding
    embedding = model.encode(
        [text],
        normalize_embeddings=True,
        batch_size=1,
        show_progress_bar=False,
    )
    return embedding[0].tolist()


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a batch of texts (more efficient than one at a time).

    Args:
        texts: List of input texts.

    Returns:
        List of embedding vectors.
    """
    model = _get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
    return [e.tolist() for e in embeddings]
