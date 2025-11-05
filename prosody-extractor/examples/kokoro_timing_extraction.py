"""Example: Extract word-level timing from Kokoro TTS for RSVP reading.

This example demonstrates how to use the Kokoro TTS provider to extract
natural prosody timing for books and long-form text without generating audio.

The extracted timing can be used to control word display in RSVP (Rapid Serial
Visual Presentation) reading applications, making reading feel more like
listening to an audiobook narrator.
"""

import sys
import os
import json
import time
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

from providers import ProviderFactory
from models.schemas import AnalysisOptions


def format_timing_display(words, max_words=20):
    """Format word timing for display."""
    lines = []
    lines.append("\n" + "="*80)
    lines.append("WORD-LEVEL TIMING ANALYSIS")
    lines.append("="*80 + "\n")
    
    for i, word in enumerate(words[:max_words]):
        duration_ms = word.baseDelay * (word.prosody.pause or 1.0)
        pause_info = f" + {word.prosody.pauseAfter}ms pause" if word.prosody.pauseAfter > 0 else ""
        emphasis_info = f" [{word.prosody.emphasis.value}]" if word.prosody.emphasis.value != 'none' else ""
        
        lines.append(
            f"{i+1:3d}. '{word.text:20s}' → {duration_ms:6.0f}ms{pause_info}{emphasis_info}"
        )
    
    if len(words) > max_words:
        lines.append(f"\n... and {len(words) - max_words} more words")
    
    lines.append("\n" + "="*80 + "\n")
    return "\n".join(lines)


def example_short_text():
    """Example 1: Extract timing from short text."""
    print("\n" + "="*80)
    print("EXAMPLE 1: Short Text Timing Extraction")
    print("="*80 + "\n")
    
    # Sample text
    text = """
    It is a truth universally acknowledged, that a single man in possession 
    of a good fortune, must be in want of a wife. However little known the 
    feelings or views of such a man may be on his first entering a neighbourhood, 
    this truth is so well fixed in the minds of the surrounding families, that 
    he is considered the rightful property of some one or other of their daughters.
    """
    
    print(f"Text: {text.strip()[:100]}...\n")
    
    # Initialize provider
    print("Initializing Kokoro TTS provider...")
    provider = ProviderFactory.create_provider("kokoro-tts", device="cpu")
    
    # Analysis options
    options = AnalysisOptions(
        wpm=250,  # Target reading speed
        sensitivity=0.8,  # How much to respect TTS timing vs. baseline
        language="en"
    )
    
    # Extract timing
    print(f"Extracting timing (target: {options.wpm} WPM)...")
    start_time = time.time()
    
    result = provider.analyze(text, options)
    
    processing_time = time.time() - start_time
    
    # Display results
    print(f"\nProcessing completed in {processing_time:.2f}s")
    print(f"Words processed: {result.metadata.wordCount}")
    print(f"Average word length: {result.metadata.avgWordLength} chars")
    print(f"Pauses detected: {result.metadata.totalPauses}")
    print(f"Emphasized words: {result.metadata.emphasisCount}")
    
    print(format_timing_display(result.words))
    
    return result


def example_book_chapter():
    """Example 2: Process a full book chapter (batch mode)."""
    print("\n" + "="*80)
    print("EXAMPLE 2: Book Chapter Processing (Batch Mode)")
    print("="*80 + "\n")
    
    # Load sample text (or use a longer passage)
    sample_file = Path(__file__).parent / "sample_data" / "sample_text.txt"
    
    if sample_file.exists():
        with open(sample_file, 'r', encoding='utf-8') as f:
            text = f.read()
        print(f"Loaded {len(text)} characters from {sample_file.name}")
    else:
        # Use a longer passage if sample file doesn't exist
        text = """
        Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, 
        and caprice, that the experience of three-and-twenty years had been insufficient 
        to make his wife understand his character. Her mind was less difficult to develop. 
        She was a woman of mean understanding, little information, and uncertain temper. 
        When she was discontented, she fancied herself nervous. The business of her life 
        was to get her daughters married; its solace was visiting and news.
        """ * 20  # Repeat to simulate longer text
        print(f"Using generated text ({len(text)} characters)")
    
    # Initialize provider
    print("\nInitializing Kokoro TTS provider...")
    provider = ProviderFactory.create_provider("kokoro-tts", device="cpu")
    
    # Analysis options
    options = AnalysisOptions(
        wpm=300,  # Faster reading speed
        sensitivity=0.7,
        language="en"
    )
    
    # Batch process with chunking
    print(f"Batch processing text (target: {options.wpm} WPM)...")
    start_time = time.time()
    
    result = provider.batch_analyze(text, options, chunk_size=500)
    
    processing_time = time.time() - start_time
    
    # Display results
    print(f"\nProcessing completed in {processing_time:.2f}s")
    print(f"Words processed: {result.metadata.wordCount}")
    print(f"Processing rate: {result.metadata.wordCount / processing_time:.0f} words/sec")
    print(f"Pauses detected: {result.metadata.totalPauses}")
    print(f"Emphasized words: {result.metadata.emphasisCount}")
    
    print(format_timing_display(result.words, max_words=30))
    
    # Calculate total reading time
    total_time_ms = sum(
        w.baseDelay * (w.prosody.pause or 1.0) + w.prosody.pauseAfter
        for w in result.words
    )
    reading_minutes = total_time_ms / 60000
    
    print(f"Estimated reading time at {options.wpm} WPM: {reading_minutes:.1f} minutes")
    
    return result


def example_export_json():
    """Example 3: Export timing to JSON for use in mreader app."""
    print("\n" + "="*80)
    print("EXAMPLE 3: Export Timing to JSON")
    print("="*80 + "\n")
    
    # Sample text
    text = "The quick brown fox jumps over the lazy dog. What a wonderful day!"
    
    # Initialize and process
    provider = ProviderFactory.create_provider("kokoro-tts", device="cpu")
    options = AnalysisOptions(wpm=250, sensitivity=0.8)
    
    print("Extracting timing...")
    result = provider.analyze(text, options)
    
    # Convert to JSON
    result_dict = result.model_dump()
    
    # Save to file
    output_file = Path(__file__).parent / "kokoro_timing_output.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_dict, f, indent=2)
    
    print(f"\nTiming data exported to: {output_file}")
    print(f"File size: {output_file.stat().st_size} bytes")
    print("\nSample JSON structure:")
    print(json.dumps({
        "method": result_dict["method"],
        "metadata": result_dict["metadata"],
        "words_sample": result_dict["words"][:3]
    }, indent=2))
    
    return result


def example_streaming():
    """Example 4: Streaming timing extraction (for real-time processing)."""
    print("\n" + "="*80)
    print("EXAMPLE 4: Streaming Timing Extraction")
    print("="*80 + "\n")
    
    text = """
    In the beginning God created the heaven and the earth. And the earth was 
    without form, and void; and darkness was upon the face of the deep. And 
    the Spirit of God moved upon the face of the waters.
    """
    
    print(f"Text: {text.strip()}\n")
    
    # Initialize streaming provider
    print("Initializing Kokoro TTS streaming provider...")
    provider = ProviderFactory.create_provider(
        "kokoro-tts-stream",
        device="cpu",
        chunk_size=50
    )
    
    options = AnalysisOptions(wpm=200, sensitivity=0.75)
    
    # Stream words as they're processed
    print("Streaming word timing:\n")
    
    words_processed = 0
    for word in provider.stream_analyze(text, options):
        duration_ms = word.baseDelay * (word.prosody.pause or 1.0)
        print(f"  {word.index:3d}. '{word.text:15s}' → {duration_ms:6.0f}ms")
        words_processed += 1
        
        # Simulate real-time processing
        time.sleep(0.05)
    
    print(f"\nStreamed {words_processed} words")


def example_comparison():
    """Example 5: Compare Kokoro timing with rule-based timing."""
    print("\n" + "="*80)
    print("EXAMPLE 5: Timing Method Comparison")
    print("="*80 + "\n")
    
    text = "Hello, world! How are you today? I am doing quite well, thank you."
    
    options = AnalysisOptions(wpm=250, sensitivity=0.8)
    
    # Process with both methods
    print("Processing with Kokoro TTS...")
    kokoro_provider = ProviderFactory.create_provider("kokoro-tts", device="cpu")
    kokoro_result = kokoro_provider.analyze(text, options)
    
    print("Processing with rule-based method...")
    rule_provider = ProviderFactory.create_provider("rule-based")
    rule_result = rule_provider.analyze(text, options)
    
    # Compare results
    print("\n" + "="*80)
    print("TIMING COMPARISON")
    print("="*80 + "\n")
    
    print(f"{'Word':<15} | {'Kokoro (ms)':<12} | {'Rule-based (ms)':<16} | {'Difference'}")
    print("-" * 80)
    
    for k_word, r_word in zip(kokoro_result.words[:15], rule_result.words[:15]):
        k_time = k_word.baseDelay * (k_word.prosody.pause or 1.0)
        r_time = r_word.baseDelay * (r_word.prosody.pause or 1.0)
        diff = k_time - r_time
        
        print(f"{k_word.text:<15} | {k_time:>10.0f} ms | {r_time:>14.0f} ms | {diff:>+7.0f} ms")
    
    # Summary statistics
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80 + "\n")
    
    k_times = [w.baseDelay * (w.prosody.pause or 1.0) for w in kokoro_result.words]
    r_times = [w.baseDelay * (w.prosody.pause or 1.0) for w in rule_result.words]
    
    print(f"Kokoro TTS:")
    print(f"  - Average duration: {sum(k_times)/len(k_times):.0f} ms")
    print(f"  - Processing time: {kokoro_result.metadata.processingTime:.3f}s")
    
    print(f"\nRule-based:")
    print(f"  - Average duration: {sum(r_times)/len(r_times):.0f} ms")
    print(f"  - Processing time: {rule_result.metadata.processingTime:.3f}s")


def main():
    """Run all examples."""
    print("\n" + "="*80)
    print("KOKORO TTS TIMING EXTRACTION - EXAMPLES")
    print("="*80)
    
    try:
        # Example 1: Short text
        example_short_text()
        
        # Example 2: Book chapter (batch)
        example_book_chapter()
        
        # Example 3: Export to JSON
        example_export_json()
        
        # Example 4: Streaming
        example_streaming()
        
        # Example 5: Comparison
        example_comparison()
        
        print("\n" + "="*80)
        print("ALL EXAMPLES COMPLETED SUCCESSFULLY!")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
