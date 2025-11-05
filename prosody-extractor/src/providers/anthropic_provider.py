"""Anthropic Claude-based prosody extraction provider."""

import json
import time
import logging
import os
from typing import Optional, List
from anthropic import Anthropic
from .base import BaseProsodyProvider
from ..models.schemas import (
    ProsodyResult,
    Word,
    ProsodyData,
    ProcessingMetadata,
    AnalysisOptions,
    Emphasis,
    Tone,
)
from ..utils.helpers import (
    tokenize_text,
    calculate_pivot_index,
    strip_punctuation,
    validate_text_length,
    retry_with_backoff,
    load_yaml_config,
)

logger = logging.getLogger(__name__)


class AnthropicProvider(BaseProsodyProvider):
    """
    Anthropic Claude-based prosody extraction.
    
    This provider uses Anthropic's Claude models to analyze text
    and generate prosody information.
    """
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize Anthropic provider.
        
        Args:
            api_key: Anthropic API key (if None, reads from ANTHROPIC_API_KEY env var)
            **kwargs: Additional configuration
        """
        super().__init__(api_key=api_key, **kwargs)
        
        # Get API key from parameter or environment
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key required. Set ANTHROPIC_API_KEY env var or pass api_key parameter.")
        
        # Initialize Anthropic client
        self.client = Anthropic(api_key=self.api_key)
        
        # Load prompts
        try:
            prompts_path = os.path.join(
                os.path.dirname(__file__),
                "../../config/prompts/prosody_prompts.yaml"
            )
            self.prompts = load_yaml_config(prompts_path)
        except Exception as e:
            logger.warning(f"Could not load prompts file: {e}. Using defaults.")
            self.prompts = self._default_prompts()
        
        # Default model
        self.default_model = kwargs.get('model', 'claude-3-5-sonnet-20241022')
        self.default_temperature = kwargs.get('temperature', 0.3)
        self.default_max_tokens = kwargs.get('max_tokens', 2000)
        
        logger.info(f"Initialized AnthropicProvider with model {self.default_model}")
    
    def _default_prompts(self) -> dict:
        """Return default prompts if config file not available."""
        return {
            "system_prompt": "You are an expert in prosody analysis for text-to-speech and speed reading applications.",
            "analysis_prompt": """Analyze the following text and provide prosody information for each word.

Text: {text}

For each word, determine:
1. pause_multiplier: How much to multiply the base reading time (1.0 = normal, 2.5 = long pause)
2. pause_after_ms: Additional milliseconds to pause after this word (0-500)
3. emphasis: Level of stress ("none", "low", "medium", "high")
4. tone: Intonation pattern ("neutral", "rising", "falling")

Respond with a JSON array where each element represents a word in order. Only return the JSON array, no other text.

Example format:
[{{"text": "word", "pause": 1.0, "pauseAfter": 0, "emphasis": "none", "tone": "neutral"}}, ...]"""
        }
    
    def get_provider_name(self) -> str:
        """Return provider name."""
        return "anthropic"
    
    def validate_config(self) -> bool:
        """Validate Anthropic configuration."""
        if not self.api_key:
            raise ValueError("Anthropic API key is required")
        return True
    
    def analyze(self, text: str, options: AnalysisOptions) -> ProsodyResult:
        """
        Analyze text using Anthropic API.
        
        Args:
            text: Text to analyze
            options: Analysis options
            
        Returns:
            ProsodyResult with word-level prosody
        """
        start_time = time.time()
        
        # Validate input
        validate_text_length(text)
        
        # Preprocess
        text = self.preprocess_text(text)
        
        # Get model parameters
        model = options.model or self.default_model
        temperature = options.temperature if options.temperature is not None else self.default_temperature
        max_tokens = options.max_tokens or self.default_max_tokens
        
        # Tokenize for word positions
        tokens = tokenize_text(text)
        
        # Call Anthropic API with retry logic
        prosody_list = self._call_anthropic_api(text, model, temperature, max_tokens)
        
        # Merge API results with token positions
        words = self._merge_results(tokens, prosody_list, options)
        
        # Calculate metadata
        processing_time = time.time() - start_time
        metadata = self._calculate_metadata(words, processing_time, model)
        
        result = ProsodyResult(
            method=self.get_provider_name(),
            metadata=metadata,
            words=words
        )
        
        return self.postprocess_result(result)
    
    def _call_anthropic_api(
        self,
        text: str,
        model: str,
        temperature: float,
        max_tokens: int
    ) -> List[dict]:
        """
        Call Anthropic API to analyze text.
        
        Args:
            text: Text to analyze
            model: Model name
            temperature: Temperature setting
            max_tokens: Max tokens for response
            
        Returns:
            List of prosody dicts from API
        """
        def _api_call():
            system_prompt = self.prompts.get("system_prompt", "")
            user_prompt = self.prompts.get("analysis_prompt", "").format(text=text)
            
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            content = response.content[0].text
            
            # Try to parse JSON from response
            # Handle cases where response might have markdown code blocks
            content = content.strip()
            if content.startswith("```"):
                # Remove markdown code block markers
                lines = content.split('\n')
                content = '\n'.join(lines[1:-1] if len(lines) > 2 else lines)
            
            # Try to parse as JSON array directly
            try:
                result = json.loads(content)
                if isinstance(result, list):
                    return result
                # If it's an object with an array inside, try to extract it
                if isinstance(result, dict):
                    for key in ['words', 'prosody', 'result', 'data']:
                        if key in result and isinstance(result[key], list):
                            return result[key]
                    # If no array found, return empty list
                    logger.warning(f"Unexpected JSON structure: {result}")
                    return []
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Anthropic response as JSON: {e}")
                logger.error(f"Response content: {content}")
                raise ValueError(f"Anthropic returned invalid JSON: {e}")
        
        # Use retry logic for API calls
        return retry_with_backoff(
            _api_call,
            max_retries=3,
            exceptions=(Exception,)
        )
    
    def _merge_results(
        self,
        tokens: List[dict],
        prosody_list: List[dict],
        options: AnalysisOptions
    ) -> List[Word]:
        """
        Merge API prosody results with token positions.
        
        Args:
            tokens: Tokenized text with positions
            prosody_list: Prosody data from API
            options: Analysis options
            
        Returns:
            List of Word objects
        """
        base_delay_ms = 60000 // options.wpm
        words = []
        
        for i, token in enumerate(tokens):
            # Get corresponding prosody data from API (if available)
            prosody_dict = prosody_list[i] if i < len(prosody_list) else {}
            
            # Parse prosody values with defaults
            pause = float(prosody_dict.get('pause', 1.0))
            pause_after = int(prosody_dict.get('pauseAfter', 0))
            emphasis_str = prosody_dict.get('emphasis', 'none').lower()
            tone_str = prosody_dict.get('tone', 'neutral').lower()
            
            # Validate and convert enums
            try:
                emphasis = Emphasis(emphasis_str)
            except ValueError:
                emphasis = Emphasis.NONE
            
            try:
                tone = Tone(tone_str)
            except ValueError:
                tone = Tone.NEUTRAL
            
            # Create prosody data
            prosody_data = ProsodyData(
                pause=pause,
                pauseAfter=pause_after,
                emphasis=emphasis,
                tone=tone
            )
            
            # Calculate pivot
            clean_text = strip_punctuation(token['text'])
            pivot = calculate_pivot_index(clean_text)
            
            # Create word
            word = Word(
                text=token['text'],
                index=i,
                start=token['start'],
                end=token['end'],
                pivotIndex=pivot,
                baseDelay=base_delay_ms,
                prosody=prosody_data
            )
            words.append(word)
        
        return words
    
    def _calculate_metadata(
        self,
        words: List[Word],
        processing_time: float,
        model: str
    ) -> ProcessingMetadata:
        """Calculate metadata about the analysis."""
        word_count = len(words)
        total_length = sum(len(strip_punctuation(w.text)) for w in words)
        avg_length = total_length / word_count if word_count > 0 else 0
        
        total_pauses = sum(1 for w in words if w.prosody.pauseAfter > 0)
        emphasis_count = sum(1 for w in words if w.prosody.emphasis != Emphasis.NONE)
        
        return ProcessingMetadata(
            wordCount=word_count,
            avgWordLength=round(avg_length, 2),
            totalPauses=total_pauses,
            emphasisCount=emphasis_count,
            processingTime=round(processing_time, 4),
            model=model
        )
    
    def get_capabilities(self) -> dict:
        """Return provider capabilities."""
        caps = super().get_capabilities()
        caps.update({
            "offline": False,
            "cost_per_100k_words": 0.15,
            "avg_processing_time_100k_words": 60.0,
            "accuracy_rating": 5,  # out of 5
        })
        return caps
