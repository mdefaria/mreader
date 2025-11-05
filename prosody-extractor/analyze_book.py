#!/usr/bin/env python3
"""
Command-line script for analyzing books with prosody extraction.

Supports both plain text (.txt) and EPUB (.epub) formats.

Usage:
    python analyze_book.py input.txt output.json --provider kokoro-tts --wpm 250
    python analyze_book.py book.epub output.json --provider kokoro-tts
    python analyze_book.py input.epub output.txt --provider kokoro-tts --format txt
"""

import sys
import json
import argparse
from pathlib import Path

# Add src to path and import as a package
sys.path.insert(0, str(Path(__file__).parent))

from src.core.processor import ProsodyProcessor
from src.utils.epub_parser import extract_text_from_epub, extract_metadata_from_epub, is_epub_file


def main():
    parser = argparse.ArgumentParser(
        description="Extract prosody timing from text/EPUB files for RSVP reading"
    )
    parser.add_argument(
        "input_file",
        type=Path,
        help="Input file to process (.txt or .epub)"
    )
    parser.add_argument(
        "output_file",
        type=Path,
        help="Output file for prosody data (.json or .txt)"
    )
    parser.add_argument(
        "--provider",
        default="kokoro-tts",
        choices=["kokoro-tts", "rule-based", "openai", "anthropic"],
        help="Prosody extraction provider (default: kokoro-tts)"
    )
    parser.add_argument(
        "--wpm",
        type=int,
        default=250,
        help="Target reading speed in words per minute (default: 250)"
    )
    parser.add_argument(
        "--sensitivity",
        type=float,
        default=0.8,
        help="Prosody sensitivity 0.0-1.0 (default: 0.8)"
    )
    parser.add_argument(
        "--format",
        choices=["json", "txt", "auto"],
        default="auto",
        help="Output format (default: auto-detect from extension)"
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1000,
        help="Words per processing chunk for large files (default: 1000)"
    )
    parser.add_argument(
        "--device",
        choices=["cpu", "cuda", "mps"],
        default="cpu",
        help="Device for Kokoro TTS (default: cpu)"
    )
    parser.add_argument(
        "--voice",
        default="af_sky",
        help="Voice for Kokoro TTS (default: af_sky)"
    )
    
    args = parser.parse_args()
    
    # Validate input file
    if not args.input_file.exists():
        print(f"Error: Input file not found: {args.input_file}", file=sys.stderr)
        sys.exit(1)
    
    # Determine output format
    output_format = args.format
    if output_format == "auto":
        output_format = "json" if args.output_file.suffix == ".json" else "txt"
    
    # Read input file
    print(f"Reading {args.input_file}...")
    metadata = {}
    
    try:
        with open(args.input_file, 'rb') as f:
            file_content = f.read()
        
        # Check if it's an EPUB file
        if is_epub_file(str(args.input_file)):
            print("Detected EPUB format, extracting text...")
            try:
                text = extract_text_from_epub(file_content)
                metadata = extract_metadata_from_epub(file_content)
                if metadata.get('title'):
                    print(f"Title: {metadata['title']}")
                if metadata.get('author'):
                    print(f"Author: {metadata['author']}")
            except ImportError as e:
                print(f"Error: {e}", file=sys.stderr)
                sys.exit(1)
            except ValueError as e:
                print(f"Error parsing EPUB: {e}", file=sys.stderr)
                sys.exit(1)
        else:
            # Plain text file
            try:
                text = file_content.decode('utf-8')
            except UnicodeDecodeError:
                print(f"Error: File must be valid UTF-8 text or EPUB format", file=sys.stderr)
                sys.exit(1)
                
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)
    
    if not text.strip():
        print(f"Error: Input file is empty", file=sys.stderr)
        sys.exit(1)
    
    print(f"Loaded {len(text)} characters, ~{len(text.split())} words")
    
    # Initialize processor
    print(f"Initializing {args.provider} provider...")
    try:
        if args.provider == "kokoro-tts":
            processor = ProsodyProcessor(
                provider=args.provider,
                device=args.device,
                voice=args.voice
            )
        else:
            processor = ProsodyProcessor(provider=args.provider)
    except Exception as e:
        print(f"Error initializing provider: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Process text
    print(f"Processing with {args.provider} (WPM={args.wpm}, sensitivity={args.sensitivity})...")
    print("This may take a few minutes for large books...")
    
    try:
        result = processor.analyze(
            text=text,
            wpm=args.wpm,
            sensitivity=args.sensitivity
        )
    except Exception as e:
        print(f"Error during analysis: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Write output
    print(f"Writing {output_format.upper()} output to {args.output_file}...")
    
    try:
        if output_format == "json":
            # Write JSON output
            output_data = result.model_dump()
            if metadata:
                output_data['epub_metadata'] = metadata
            
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        else:  # txt format
            # Write human-readable text format
            with open(args.output_file, 'w', encoding='utf-8') as f:
                f.write(f"Prosody Analysis Results\n")
                f.write(f"========================\n\n")
                f.write(f"Input: {args.input_file.name}\n")
                
                # Add EPUB metadata if available
                if metadata:
                    if metadata.get('title'):
                        f.write(f"Title: {metadata['title']}\n")
                    if metadata.get('author'):
                        f.write(f"Author: {metadata['author']}\n")
                    if metadata.get('language'):
                        f.write(f"Language: {metadata['language']}\n")
                
                f.write(f"Provider: {result.method}\n")
                f.write(f"Words: {result.metadata.wordCount}\n")
                f.write(f"Avg word length: {result.metadata.avgWordLength:.1f} chars\n")
                f.write(f"Processing time: {result.metadata.processingTime:.2f}s\n")
                f.write(f"Speed: {result.metadata.wordCount / result.metadata.processingTime:.0f} words/sec\n\n")
                f.write(f"Word Timings:\n")
                f.write(f"-------------\n\n")
                
                for word in result.words:
                    duration = word.baseDelay * word.prosody.pause
                    f.write(f"{word.index:5d}. {word.text:20s} {duration:6.0f}ms")
                    if word.prosody.pauseAfter > 0:
                        f.write(f" +{word.prosody.pauseAfter}ms")
                    if word.prosody.emphasis.value != "none":
                        f.write(f" [{word.prosody.emphasis.value}]")
                    f.write(f"\n")
    
    except Exception as e:
        print(f"Error writing output: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Success summary
    print(f"\n✓ Success!")
    print(f"  Words processed: {result.metadata.wordCount}")
    print(f"  Processing time: {result.metadata.processingTime:.2f}s")
    print(f"  Output file: {args.output_file}")
    print(f"  File size: {args.output_file.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
