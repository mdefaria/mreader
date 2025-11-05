"""Example of using the prosody extractor via REST API."""

import requests
import json
import time


def main():
    """Demonstrate API usage."""
    
    # API base URL (adjust if server is running elsewhere)
    BASE_URL = "http://localhost:8000/api/v1"
    
    print("=" * 80)
    print("Prosody Extractor - API Usage Example")
    print("=" * 80)
    print()
    print("Note: Make sure the API server is running:")
    print("  python src/main.py")
    print()
    
    # Check health
    print("1. Health Check")
    print("-" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        health = response.json()
        print(f"Status: {health['status']}")
        print(f"Version: {health['version']}")
        print(f"Available providers: {', '.join(health['providers'])}")
        print()
    except Exception as e:
        print(f"Error: Could not connect to API server: {e}")
        print("Please start the server with: python src/main.py")
        return
    
    # List providers
    print("2. List Providers")
    print("-" * 80)
    
    response = requests.get(f"{BASE_URL}/providers")
    providers_info = response.json()
    
    for name, info in providers_info['providers'].items():
        if 'error' in info:
            print(f"  {name}: {info['error']}")
        else:
            caps = info['capabilities']
            print(f"  {name}:")
            print(f"    - Offline: {caps.get('offline', False)}")
            print(f"    - Accuracy: {'⭐' * caps.get('accuracy_rating', 0)}")
    print()
    
    # Analyze text (rule-based)
    print("3. Analyze Text (Rule-based)")
    print("-" * 80)
    
    sample_text = "Hello, world! How are you doing today?"
    
    payload = {
        "text": sample_text,
        "provider": "rule-based",
        "options": {
            "wpm": 300,
            "sensitivity": 0.7
        }
    }
    
    start = time.time()
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    elapsed = time.time() - start
    
    response.raise_for_status()
    result = response.json()
    
    print(f"Text: \"{sample_text}\"")
    print(f"Method: {result['method']}")
    print(f"Words: {result['metadata']['wordCount']}")
    print(f"Processing time: {result['metadata']['processingTime']:.4f}s")
    print(f"API round-trip time: {elapsed:.4f}s")
    print()
    
    # Show prosody for each word
    print("Word-by-word prosody:")
    for word in result['words']:
        prosody = word['prosody']
        print(f"  '{word['text']}' - pause: {prosody['pause']:.2f}x, "
              f"pauseAfter: {prosody['pauseAfter']}ms, "
              f"emphasis: {prosody['emphasis']}")
    print()
    
    # Save full result
    output_file = "/tmp/api_result.json"
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Full result saved to: {output_file}")
    print()
    
    print("=" * 80)
    print("Example complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
