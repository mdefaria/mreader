"""Core prosody processing logic."""

import logging
from typing import Optional, Dict, Any
from ..models.schemas import ProsodyResult, AnalysisOptions
from ..providers import ProviderFactory

logger = logging.getLogger(__name__)


class ProsodyProcessor:
    """
    Main prosody processor that orchestrates analysis.
    
    This class provides a high-level interface for prosody extraction
    using different providers.
    """
    
    def __init__(
        self,
        provider: str = "rule-based",
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize prosody processor.
        
        Args:
            provider: Provider name ("rule-based", "openai", "anthropic")
            api_key: Optional API key for LLM providers
            **kwargs: Additional provider configuration
        """
        self.provider_name = provider
        self.provider = ProviderFactory.create_provider(
            provider,
            api_key=api_key,
            **kwargs
        )
        
        # Validate provider configuration
        self.provider.validate_config()
        
        logger.info(f"Initialized ProsodyProcessor with {provider} provider")
    
    def analyze(
        self,
        text: str,
        wpm: int = 300,
        sensitivity: float = 0.7,
        **options
    ) -> ProsodyResult:
        """
        Analyze text and extract prosody information.
        
        Args:
            text: Text to analyze
            wpm: Words per minute (base reading speed)
            sensitivity: Prosody sensitivity (0.0 to 1.0)
            **options: Additional provider-specific options
            
        Returns:
            ProsodyResult with word-level prosody information
            
        Raises:
            ValueError: If input is invalid
            RuntimeError: If analysis fails
        """
        # Create options object
        analysis_options = AnalysisOptions(
            wpm=wpm,
            sensitivity=sensitivity,
            **options
        )
        
        # Delegate to provider
        result = self.provider.analyze(text, analysis_options)
        
        logger.info(
            f"Analyzed {result.metadata.wordCount} words in "
            f"{result.metadata.processingTime:.2f}s using {self.provider_name}"
        )
        
        return result
    
    def get_provider_info(self) -> Dict[str, Any]:
        """
        Get information about the current provider.
        
        Returns:
            Dictionary with provider capabilities and configuration
        """
        return {
            "name": self.provider.get_provider_name(),
            "capabilities": self.provider.get_capabilities(),
        }
    
    @staticmethod
    def list_providers() -> list[str]:
        """
        List all available providers.
        
        Returns:
            List of provider names
        """
        return ProviderFactory.list_providers()
