"""Tests for core processing logic."""

import pytest
from src.core.processor import ProsodyProcessor
from src.models.schemas import ProsodyResult


class TestProsodyProcessor:
    """Tests for ProsodyProcessor."""
    
    def test_initialization_rule_based(self):
        """Test initialization with rule-based provider."""
        processor = ProsodyProcessor(provider="rule-based")
        assert processor.provider_name == "rule-based"
    
    def test_analyze_simple_text(self):
        """Test analyzing simple text."""
        processor = ProsodyProcessor(provider="rule-based")
        
        text = "Hello, world!"
        result = processor.analyze(text, wpm=300, sensitivity=0.7)
        
        assert isinstance(result, ProsodyResult)
        assert result.metadata.wordCount == 2
        assert len(result.words) == 2
        assert result.method == "rule-based"
    
    def test_analyze_with_different_wpm(self):
        """Test that WPM parameter works."""
        processor = ProsodyProcessor(provider="rule-based")
        
        text = "Testing speed"
        result = processor.analyze(text, wpm=600)
        
        # Higher WPM should result in shorter base delays
        assert result.words[0].baseDelay == 100  # 60000 / 600
    
    def test_analyze_with_sensitivity(self):
        """Test sensitivity parameter."""
        processor = ProsodyProcessor(provider="rule-based")
        
        text = "Hello. World."
        
        # Low sensitivity
        result_low = processor.analyze(text, sensitivity=0.1)
        
        # High sensitivity
        result_high = processor.analyze(text, sensitivity=1.0)
        
        # High sensitivity should have longer pauses
        assert result_high.words[0].prosody.pause >= result_low.words[0].prosody.pause
    
    def test_get_provider_info(self):
        """Test getting provider information."""
        processor = ProsodyProcessor(provider="rule-based")
        info = processor.get_provider_info()
        
        assert info["name"] == "rule-based"
        assert "capabilities" in info
        assert info["capabilities"]["offline"] is True
    
    def test_list_providers(self):
        """Test listing available providers."""
        providers = ProsodyProcessor.list_providers()
        
        assert isinstance(providers, list)
        assert "rule-based" in providers
        assert len(providers) >= 1
    
    def test_empty_text_raises_error(self):
        """Test that empty text raises validation error."""
        processor = ProsodyProcessor(provider="rule-based")
        
        with pytest.raises(ValueError, match="cannot be empty"):
            processor.analyze("")
    
    def test_very_long_text(self):
        """Test processing longer text."""
        processor = ProsodyProcessor(provider="rule-based")
        
        # Generate longer text
        text = " ".join([f"word{i}" for i in range(1000)])
        result = processor.analyze(text, wpm=300)
        
        assert result.metadata.wordCount == 1000
        assert len(result.words) == 1000
        assert result.metadata.processingTime is not None


class TestProsodyProcessorWithOptions:
    """Tests for processor with various options."""
    
    def test_custom_model_option(self):
        """Test passing custom model option."""
        processor = ProsodyProcessor(provider="rule-based")
        
        # Rule-based doesn't use model, but should accept the option
        result = processor.analyze(
            "Test text",
            model="custom-model"
        )
        
        assert isinstance(result, ProsodyResult)
    
    def test_temperature_option(self):
        """Test passing temperature option."""
        processor = ProsodyProcessor(provider="rule-based")
        
        # Rule-based doesn't use temperature, but should accept it
        result = processor.analyze(
            "Test text",
            temperature=0.5
        )
        
        assert isinstance(result, ProsodyResult)
