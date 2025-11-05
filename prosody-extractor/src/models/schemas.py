"""Data models and schemas for prosody analysis."""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class Emphasis(str, Enum):
    """Word emphasis levels."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Tone(str, Enum):
    """Intonation tone patterns."""
    NEUTRAL = "neutral"
    RISING = "rising"
    FALLING = "falling"


class ProsodyData(BaseModel):
    """Prosody information for a single word."""
    pause: float = Field(
        default=1.0,
        ge=0.5,
        le=5.0,
        description="Multiplier for base reading time (1.0 = normal, 2.5 = long pause)"
    )
    pauseAfter: int = Field(
        default=0,
        ge=0,
        le=2000,
        description="Additional milliseconds to pause after this word"
    )
    emphasis: Emphasis = Field(
        default=Emphasis.NONE,
        description="Level of stress on the word"
    )
    tone: Tone = Field(
        default=Tone.NEUTRAL,
        description="Intonation pattern"
    )
    pitch: Optional[float] = Field(
        default=None,
        description="Optional pitch value in Hz for TTS"
    )
    loudness: Optional[float] = Field(
        default=None,
        description="Optional loudness value in dB for TTS"
    )


class Word(BaseModel):
    """Word with prosody information."""
    text: str = Field(description="The word text including punctuation")
    index: int = Field(ge=0, description="Sequential word index")
    start: int = Field(ge=0, description="Character start position in original text")
    end: int = Field(ge=0, description="Character end position in original text")
    pivotIndex: int = Field(ge=0, description="Optimal recognition point (30-35% into word)")
    baseDelay: int = Field(gt=0, description="Base display time in milliseconds (60000/WPM)")
    prosody: ProsodyData = Field(description="Prosody information for this word")


class ProcessingMetadata(BaseModel):
    """Metadata about the processing."""
    wordCount: int = Field(ge=0)
    avgWordLength: float = Field(ge=0)
    totalPauses: Optional[int] = Field(default=None)
    emphasisCount: Optional[int] = Field(default=None)
    processingTime: Optional[float] = Field(default=None, description="Processing time in seconds")
    model: Optional[str] = Field(default=None, description="Model used for processing")


class ProsodyResult(BaseModel):
    """Complete prosody analysis result."""
    version: str = Field(default="1.0", description="Result format version")
    method: str = Field(description="Processing method used (rule-based, openai, anthropic, etc.)")
    metadata: ProcessingMetadata
    words: List[Word]


class AnalysisRequest(BaseModel):
    """Request model for prosody analysis."""
    text: str = Field(min_length=1, max_length=500000, description="Text to analyze")
    provider: str = Field(
        default="rule-based",
        description="Provider to use (rule-based, openai, anthropic)"
    )
    options: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Provider-specific options"
    )


class AnalysisOptions(BaseModel):
    """Options for prosody analysis."""
    wpm: int = Field(default=300, ge=100, le=1000, description="Words per minute")
    sensitivity: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Prosody sensitivity (0.0 = minimal, 1.0 = maximum)"
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (provider-dependent)"
    )
    temperature: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="LLM temperature for creativity"
    )
    max_tokens: Optional[int] = Field(
        default=None,
        gt=0,
        description="Maximum tokens for LLM response"
    )


class ProviderConfig(BaseModel):
    """Configuration for an LLM provider."""
    model: str
    temperature: float = Field(ge=0.0, le=2.0)
    max_tokens: int = Field(gt=0)
    api_key: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    providers: List[str]
