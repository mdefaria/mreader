"""Tests for prosody providers."""

import pytest
from src.providers import RuleBasedProvider, ProviderFactory
from src.models.schemas import AnalysisOptions, Emphasis, Tone


class TestRuleBasedProvider:
    """Tests for rule-based provider."""
    
    def test_initialization(self):
        """Test provider initialization."""
        provider = RuleBasedProvider()
        assert provider.get_provider_name() == "rule-based"
        assert provider.validate_config() is True
    
    def test_simple_analysis(self):
        """Test basic text analysis."""
        provider = RuleBasedProvider()
        options = AnalysisOptions(wpm=300, sensitivity=0.7)
        
        text = "Hello, world!"
        result = provider.analyze(text, options)
        
        assert result.method == "rule-based"
        assert result.metadata.wordCount == 2
        assert len(result.words) == 2
    
    def test_punctuation_pauses(self):
        """Test that punctuation affects pauses."""
        provider = RuleBasedProvider()
        options = AnalysisOptions(wpm=300, sensitivity=0.7)
        
        text = "Hello. World!"
        result = provider.analyze(text, options)
        
        # Period should add pause
        assert result.words[0].prosody.pause > 1.0
        assert result.words[0].prosody.tone == Tone.FALLING
    
    def test_emphasis_detection(self):
        """Test emphasis detection for all caps."""
        provider = RuleBasedProvider()
        options = AnalysisOptions(wpm=300, sensitivity=0.7)
        
        text = "This is IMPORTANT text"
        result = provider.analyze(text, options)
        
        # IMPORTANT should have high emphasis
        important_word = result.words[2]
        assert important_word.prosody.emphasis == Emphasis.HIGH
    
    def test_wpm_affects_base_delay(self):
        """Test that WPM affects base delay."""
        provider = RuleBasedProvider()
        
        text = "Hello world"
        
        result_300 = provider.analyze(text, AnalysisOptions(wpm=300))
        result_600 = provider.analyze(text, AnalysisOptions(wpm=600))
        
        # Higher WPM should mean shorter base delay
        assert result_300.words[0].baseDelay > result_600.words[0].baseDelay


class TestProviderFactory:
    """Tests for provider factory."""
    
    def test_list_providers(self):
        """Test listing available providers."""
        providers = ProviderFactory.list_providers()
        assert "rule-based" in providers
        assert len(providers) >= 1
    
    def test_create_rule_based(self):
        """Test creating rule-based provider."""
        provider = ProviderFactory.create_provider("rule-based")
        assert provider.get_provider_name() == "rule-based"
    
    def test_create_unknown_provider(self):
        """Test creating unknown provider raises error."""
        with pytest.raises(ValueError, match="Unknown provider"):
            ProviderFactory.create_provider("nonexistent")


class TestOpenAIProvider:
    """Tests for OpenAI provider (requires API key)."""
    
    def test_initialization_without_api_key(self):
        """Test that provider requires API key."""
        # This should raise ValueError if no API key in environment
        import os
        if "OPENAI_API_KEY" not in os.environ:
            with pytest.raises(ValueError, match="API key required"):
                from src.providers import OpenAIProvider
                OpenAIProvider()


class TestAnthropicProvider:
    """Tests for Anthropic provider (requires API key)."""
    
    def test_initialization_without_api_key(self):
        """Test that provider requires API key."""
        # This should raise ValueError if no API key in environment
        import os
        if "ANTHROPIC_API_KEY" not in os.environ:
            with pytest.raises(ValueError, match="API key required"):
                from src.providers import AnthropicProvider
                AnthropicProvider()
