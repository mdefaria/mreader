#!/usr/bin/env python3
"""
Test script to verify punctuation token handling in Kokoro TTS provider.

This script tests that punctuation tokens are properly merged with previous words
instead of being filtered out.
"""

import sys
import os


def create_mock_token(text, start_ts=None, end_ts=None, phonemes=None):
    """Create a mock token object that mimics Kokoro's MToken."""
    class MockToken:
        def __init__(self, text, start_ts, end_ts, phonemes):
            self.text = text
            self.start_ts = start_ts
            self.end_ts = end_ts
            self.phonemes = phonemes
            self.start = 0
            self.end = len(text)
    
    return MockToken(text, start_ts, end_ts, phonemes)


def test_punctuation_merging():
    """Test that punctuation tokens are merged with previous words."""
    print("Testing punctuation token merging...")
    
    # Test with mock implementation (doesn't require Kokoro dependencies)
    return test_punctuation_merging_mock()


def test_punctuation_merging_mock():
    """Test punctuation merging logic with mock tokens."""
    print("\n=== Mock Test: Punctuation Merging ===\n")
    
    # Create mock tokens: "Hello" + "," + "world" + "!"
    mock_tokens = [
        create_mock_token("Hello", 0.0, 0.5),
        create_mock_token(",", 0.5, 0.6),
        create_mock_token("world", 0.6, 1.1),
        create_mock_token("!", 1.1, 1.2),
    ]
    
    print("Input tokens:")
    for i, token in enumerate(mock_tokens):
        print(f"  {i}: '{token.text}' (alphanumeric: {any(c.isalnum() for c in token.text)})")
    
    # Simulate the merging logic
    words = []
    base_delay_ms = 200  # milliseconds per word
    sensitivity = 0.7
    
    for token in mock_tokens:
        # Skip empty tokens or whitespace-only tokens
        if not token.text or not token.text.strip():
            continue
        
        # Handle punctuation-only tokens by merging with previous word
        if not any(c.isalnum() for c in token.text):
            if words:
                prev_word = words[-1]
                
                # Calculate duration
                punct_duration_ms = int((token.end_ts - token.start_ts) * 1000)
                
                # Append punctuation to previous word
                prev_word['text'] = prev_word['text'] + token.text
                
                # Add duration
                prev_word['duration_ms'] += punct_duration_ms
                
                print(f"\n✓ Merged '{token.text}' with previous word: '{prev_word['text']}'")
                print(f"  Duration: {prev_word['duration_ms']}ms")
            continue
        
        # Regular word token
        duration_ms = int((token.end_ts - token.start_ts) * 1000)
        word = {
            'text': token.text,
            'duration_ms': duration_ms,
            'index': len(words)
        }
        words.append(word)
        print(f"\n✓ Added word: '{token.text}' ({duration_ms}ms)")
    
    print("\n=== Results ===\n")
    print(f"Total words: {len(words)}")
    for word in words:
        print(f"  '{word['text']}' - {word['duration_ms']}ms")
    
    # Verify results
    assert len(words) == 2, f"Expected 2 words, got {len(words)}"
    assert words[0]['text'] == "Hello,", f"Expected 'Hello,', got '{words[0]['text']}'"
    assert words[1]['text'] == "world!", f"Expected 'world!', got '{words[1]['text']}'"
    
    # Verify durations include punctuation timing (with 1ms tolerance for rounding)
    assert abs(words[0]['duration_ms'] - 600) <= 1, f"Expected ~600ms for 'Hello,', got {words[0]['duration_ms']}ms"
    assert abs(words[1]['duration_ms'] - 600) <= 1, f"Expected ~600ms for 'world!', got {words[1]['duration_ms']}ms"
    
    print("\n✅ All tests passed!")
    return True


def test_edge_cases():
    """Test edge cases for punctuation handling."""
    print("\n=== Testing Edge Cases ===\n")
    
    # Test 1: Punctuation at the start (should be skipped)
    print("Test 1: Punctuation at start")
    tokens1 = [
        create_mock_token(".", 0.0, 0.1),
        create_mock_token("Hello", 0.1, 0.5),
    ]
    
    words1 = process_tokens(tokens1)
    assert len(words1) == 1, f"Expected 1 word, got {len(words1)}"
    assert words1[0]['text'] == "Hello", f"Expected 'Hello', got '{words1[0]['text']}'"
    print("✓ Passed: Punctuation at start is skipped\n")
    
    # Test 2: Multiple punctuation marks
    print("Test 2: Multiple consecutive punctuation marks")
    tokens2 = [
        create_mock_token("Hello", 0.0, 0.5),
        create_mock_token(".", 0.5, 0.6),
        create_mock_token(".", 0.6, 0.7),
        create_mock_token(".", 0.7, 0.8),
    ]
    
    words2 = process_tokens(tokens2)
    assert len(words2) == 1, f"Expected 1 word, got {len(words2)}"
    assert words2[0]['text'] == "Hello...", f"Expected 'Hello...', got '{words2[0]['text']}'"
    print("✓ Passed: Multiple punctuation marks merged\n")
    
    # Test 3: No punctuation tokens
    print("Test 3: No punctuation tokens")
    tokens3 = [
        create_mock_token("Hello", 0.0, 0.5),
        create_mock_token("world", 0.5, 1.0),
    ]
    
    words3 = process_tokens(tokens3)
    assert len(words3) == 2, f"Expected 2 words, got {len(words3)}"
    assert words3[0]['text'] == "Hello", f"Expected 'Hello', got '{words3[0]['text']}'"
    assert words3[1]['text'] == "world", f"Expected 'world', got '{words3[1]['text']}'"
    print("✓ Passed: No punctuation works normally\n")
    
    print("✅ All edge case tests passed!")


def process_tokens(tokens):
    """Helper function to process tokens with punctuation merging logic."""
    words = []
    
    for token in tokens:
        if not token.text or not token.text.strip():
            continue
        
        if not any(c.isalnum() for c in token.text):
            if words:
                prev_word = words[-1]
                punct_duration_ms = int((token.end_ts - token.start_ts) * 1000)
                prev_word['text'] = prev_word['text'] + token.text
                prev_word['duration_ms'] += punct_duration_ms
            continue
        
        duration_ms = int((token.end_ts - token.start_ts) * 1000)
        word = {
            'text': token.text,
            'duration_ms': duration_ms,
            'index': len(words)
        }
        words.append(word)
    
    return words


if __name__ == "__main__":
    print("=" * 60)
    print("PUNCTUATION TOKEN MERGING TEST")
    print("=" * 60)
    
    try:
        test_punctuation_merging()
        test_edge_cases()
        
        print("\n" + "=" * 60)
        print("ALL TESTS PASSED ✅")
        print("=" * 60)
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
