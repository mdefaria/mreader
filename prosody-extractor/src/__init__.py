"""Prosody Extractor package."""

__version__ = "1.0.0"

from .core.processor import ProsodyProcessor
from .models.schemas import ProsodyResult, AnalysisOptions, Word, ProsodyData
from .providers import ProviderFactory

__all__ = [
    "ProsodyProcessor",
    "ProsodyResult",
    "AnalysisOptions",
    "Word",
    "ProsodyData",
    "ProviderFactory",
]
