"""Abstract base class for prosody extraction providers."""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from ..models.schemas import ProsodyResult, AnalysisOptions


class BaseProsodyProvider(ABC):
    """Abstract base class for prosody extraction providers."""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the provider.
        
        Args:
            api_key: Optional API key for the provider
            **kwargs: Additional configuration options
        """
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def analyze(self, text: str, options: AnalysisOptions) -> ProsodyResult:
        """
        Analyze text and return prosody information.
        
        Args:
            text: Text to analyze
            options: Analysis options (WPM, sensitivity, etc.)
            
        Returns:
            ProsodyResult with word-level prosody information
            
        Raises:
            ValueError: If text is invalid
            RuntimeError: If analysis fails
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Return provider identifier.
        
        Returns:
            Provider name (e.g., "openai", "anthropic", "rule-based")
        """
        pass
    
    @abstractmethod
    def validate_config(self) -> bool:
        """
        Validate provider configuration.
        
        Returns:
            True if configuration is valid
            
        Raises:
            ValueError: If configuration is invalid
        """
        pass
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return provider capabilities.
        
        Returns:
            Dictionary describing provider capabilities
        """
        return {
            "name": self.get_provider_name(),
            "requires_api_key": self.api_key is not None,
            "supports_streaming": False,
            "max_text_length": 500000,
        }
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text before analysis (can be overridden).
        
        Args:
            text: Raw input text
            
        Returns:
            Preprocessed text
        """
        # Basic preprocessing: normalize whitespace
        return ' '.join(text.split())
    
    def postprocess_result(self, result: ProsodyResult) -> ProsodyResult:
        """
        Postprocess analysis result (can be overridden).
        
        Args:
            result: Raw analysis result
            
        Returns:
            Postprocessed result
        """
        return result


class ProviderFactory:
    """Factory for creating prosody provider instances."""
    
    _providers: Dict[str, type[BaseProsodyProvider]] = {}
    
    @classmethod
    def register_provider(cls, name: str, provider_class: type[BaseProsodyProvider]) -> None:
        """
        Register a provider class.
        
        Args:
            name: Provider name
            provider_class: Provider class (must inherit from BaseProsodyProvider)
        """
        if not issubclass(provider_class, BaseProsodyProvider):
            raise TypeError(f"{provider_class} must inherit from BaseProsodyProvider")
        cls._providers[name] = provider_class
    
    @classmethod
    def create_provider(cls, name: str, **kwargs) -> BaseProsodyProvider:
        """
        Create a provider instance.
        
        Args:
            name: Provider name
            **kwargs: Provider configuration
            
        Returns:
            Provider instance
            
        Raises:
            ValueError: If provider is unknown
        """
        if name not in cls._providers:
            available = ", ".join(cls._providers.keys())
            raise ValueError(f"Unknown provider: {name}. Available providers: {available}")
        
        return cls._providers[name](**kwargs)
    
    @classmethod
    def list_providers(cls) -> List[str]:
        """
        List all registered providers.
        
        Returns:
            List of provider names
        """
        return list(cls._providers.keys())
