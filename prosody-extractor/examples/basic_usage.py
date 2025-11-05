"""Basic usage example for prosody extraction."""

import sys
import os
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.core.processor import ProsodyProcessor


def main():
    """Demonstrate basic usage of the prosody extractor."""
    
    # Sample text
    text = """
    It is a truth universally acknowledged, that a single man in 
    possession of a good fortune, must be in want of a wife.
    """
    
    print("=" * 80)
    print("Prosody Extractor - Basic Usage Example")
    print("=" * 80)
    print()
    
    # Example 1: Rule-based analysis (no API required)
    print("1. Rule-based Analysis (offline, fast, no API required)")
    print("-" * 80)
    
    processor = ProsodyProcessor(provider="rule-based")
    result = processor.analyze(text, wpm=300, sensitivity=0.7)
    
    print(f"Provider: {result.method}")
    print(f"Words analyzed: {result.metadata.wordCount}")
    print(f"Processing time: {result.metadata.processingTime:.4f}s")
    print(f"Average word length: {result.metadata.avgWordLength}")
    print()
    
    # Show first 5 words
    print("First 5 words with prosody:")
    for word in result.words[:5]:
        print(f"  '{word.text}' - pause: {word.prosody.pause:.2f}x, "
              f"emphasis: {word.prosody.emphasis}, tone: {word.prosody.tone}")
    print()
    
    # Example 2: Get provider info
    print("2. Provider Information")
    print("-" * 80)
    
    info = processor.get_provider_info()
    print(f"Provider: {info['name']}")
    print(f"Capabilities: {json.dumps(info['capabilities'], indent=2)}")
    print()
    
    # Example 3: List available providers
    print("3. Available Providers")
    print("-" * 80)
    
    providers = ProsodyProcessor.list_providers()
    print(f"Available providers: {', '.join(providers)}")
    print()
    
    # Example 4: Analyze with different WPM
    print("4. Different Reading Speeds")
    print("-" * 80)
    
    for wpm in [200, 300, 500]:
        result = processor.analyze(text, wpm=wpm, sensitivity=0.7)
        first_word = result.words[0]
        print(f"WPM {wpm}: Base delay = {first_word.baseDelay}ms per word")
    print()
    
    # Example 5: Save result as JSON
    print("5. Export as JSON")
    print("-" * 80)
    
    result_json = result.model_dump_json(indent=2)
    output_file = "/tmp/prosody_result.json"
    
    with open(output_file, 'w') as f:
        f.write(result_json)
    
    print(f"Result saved to: {output_file}")
    print(f"File size: {len(result_json)} bytes")
    print()
    
    print("=" * 80)
    print("Example complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
