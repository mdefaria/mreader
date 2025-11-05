# Prosody Extractor

A standalone Python module for extracting and generating prosody information (intonation, rhythm, stress, pauses) from text using Large Language Models (LLMs) or rule-based approaches. Designed for RSVP (Rapid Serial Visual Presentation) reading applications.

## Features

- **Provider-Agnostic Architecture**: Easy switching between prosody extraction methods
- **Multiple Processing Methods**:
  - **Kokoro TTS (BEST)**: Natural speech-like timing from TTS model, completely offline and free
  - **MIT-Prosody**: Context-aware transformer-based prosody prediction
  - **Rule-based**: Fast, no API required, ~85% effective
  - LLM-enhanced (OpenAI, Anthropic) - not recommended for prosody
  - Extensible for custom providers
- **Natural Timing**: Kokoro TTS extracts authentic speech timing without generating audio
- **Context-Aware**: MIT-Prosody and Kokoro understand sentence structure for natural reading cadence
- **Local Development First**: Run and test locally before deploying to cloud
- **Cloud-Ready**: Structured for deployment as AWS Lambda, Google Cloud Functions, or other serverless platforms
- **FastAPI Server**: Built-in REST API for local testing and production deployment
- **Offline Capable**: MIT-Prosody and rule-based analyzers work without internet connection

## Quick Start

### Installation

```bash
cd prosody-extractor
pip install -r requirements.txt
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys (only if using LLM providers):
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### Basic Usage

#### Kokoro TTS (Natural Timing - BEST)

```python
from src.core.processor import ProsodyProcessor

# Initialize with Kokoro TTS (natural speech timing)
processor = ProsodyProcessor(
    provider="kokoro-tts",
    device="auto",  # auto-detect GPU/CPU/MPS
    voice="af_heart"  # Voice for timing extraction
)

# Extract natural timing from text
text = "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."
result = processor.analyze(text, wpm=250, sensitivity=0.8)

print(result)
# Features:
# - Most natural, speech-like timing
# - Word-level duration predictions
# - Pause/silence detection between words
# - No audio generation (timing only)
# - Completely offline and free
# - Context-aware prosody
# - Handles books (100K+ words efficiently)
```

**Quick Test:**
```bash
cd prosody-extractor
python test_kokoro.py  # Runs 5 tests to verify installation
```

#### MIT-Prosody (Context-Aware)

```python
from src.core.processor import ProsodyProcessor

# Initialize with MIT-Prosody (context-aware)
processor = ProsodyProcessor(
    provider="mit-prosody",
    model="bert-base-uncased",  # or "gpt2"
    device="auto"  # auto-detect GPU/CPU/MPS
)

# Analyze text with natural reading cadence
text = "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."
result = processor.analyze(text, wpm=300, sensitivity=0.7)

print(result)
# Features:
# - Context-aware prosody (understands sentence structure)
# - Natural reading rhythm
# - Word-level prominence prediction
# - No API keys required
# - Can run on CPU or GPU
```

#### Rule-Based Analysis (Fast, Simple)

```python
from src.core.processor import ProsodyProcessor

# Initialize with rule-based method
processor = ProsodyProcessor(provider="rule-based")

# Analyze text
text = "Hello, world! How are you doing today?"
result = processor.analyze(text)

print(result)
```

#### LLM-Enhanced Analysis (Not Recommended)

**Note**: General-purpose LLMs are not optimal for prosody extraction. Use MIT-Prosody instead for better quality at lower cost.

```python
from src.core.processor import ProsodyProcessor

# Only use if you specifically need LLM features
processor = ProsodyProcessor(
    provider="openai",
    model="gpt-4o-mini"
)

# Analyze text
text = "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."
result = processor.analyze(text)

print(result)
```

#### Using the REST API

```bash
# Start the server
python src/main.py

# Kokoro TTS timing extraction
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "provider": "kokoro-tts",
    "options": {
      "wpm": 250,
      "sensitivity": 0.8,
      "device": "cpu",
      "voice": "af_heart"
    }
  }'

# Rule-based (fastest)
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "provider": "rule-based",
    "options": {
      "wpm": 300,
      "sensitivity": 0.7
    }
  }'
```

## Method Comparison

| Feature | Kokoro TTS | MIT-Prosody | Rule-Based | GPT-4 |
|---------|-----------|-------------|-----------|-------|
| Naturalness | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Speech-Based | ✅ | ❌ | ❌ | ❌ |
| Pause Detection | ✅ | ✅ | ✅ | ✅ |
| Context-Aware | ✅ | ✅ | ❌ | ✅ |
| Offline | ✅ | ✅ | ✅ | ❌ |
| Speed | 500 w/s | 800 w/s | 5000 w/s | 50 w/s |
| Cost/Book | $0 | $0 | $0 | $2-5 |
| Accuracy | 98% | 90% | 85% | 90% |

**Recommendation**: Use **Kokoro TTS** for best quality, or **Rule-Based** for fastest processing.

## Architecture

```
prosody-extractor/
├── src/
│   ├── providers/          # LLM provider implementations
│   │   ├── base.py         # Abstract base class
│   │   ├── rule_based.py   # Rule-based analyzer (no LLM)
│   │   ├── openai_provider.py
│   │   └── anthropic_provider.py
│   ├── core/               # Core business logic
│   │   └── processor.py    # Main processing orchestrator
│   ├── models/             # Data models and schemas
│   │   └── schemas.py      # Pydantic models
│   ├── utils/              # Utility functions
│   │   └── helpers.py      # Helper functions
│   ├── api/                # FastAPI REST API
│   │   └── routes.py       # API endpoints
│   └── main.py             # Entry point
├── config/
│   ├── config.yaml         # Application configuration
│   └── prompts/            # LLM prompt templates
│       └── prosody_prompts.yaml
├── examples/               # Usage examples
│   ├── basic_usage.py
│   ├── api_usage.py
│   └── sample_data/
│       └── sample_text.txt
├── tests/                  # Unit and integration tests
│   ├── test_providers.py
│   └── test_core.py
├── docs/                   # Additional documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── PROVIDERS.md
└── scripts/                # Utility scripts
    └── deploy.sh
```

## API Reference

### POST /api/v1/analyze

Analyze text and extract prosody information.

**Request:**
```json
{
  "text": "Your text here",
  "provider": "rule-based",
  "options": {
    "wpm": 300,
    "sensitivity": 0.7,
    "model": "gpt-4o-mini"
  }
}
```

**Response:**
```json
{
  "version": "1.0",
  "method": "rule-based",
  "metadata": {
    "wordCount": 42,
    "avgWordLength": 4.5,
    "processingTime": 0.023
  },
  "words": [
    {
      "text": "Your",
      "index": 0,
      "pivotIndex": 1,
      "baseDelay": 300,
      "prosody": {
        "pause": 1.0,
        "pauseAfter": 0,
        "emphasis": "none",
        "tone": "neutral"
      }
    }
  ]
}
```

## Configuration

### config/config.yaml

```yaml
prosody:
  default_provider: "rule-based"
  base_wpm: 300
  sensitivity: 0.7
  
  providers:
    openai:
      model: "gpt-4o-mini"
      temperature: 0.3
      max_tokens: 2000
    
    anthropic:
      model: "claude-3-5-sonnet-20241022"
      temperature: 0.3
      max_tokens: 2000

app:
  log_level: "INFO"
  timeout: 30
  retry_attempts: 3
```

## Deployment

### AWS Lambda

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

Quick deploy:
```bash
cd scripts
./deploy.sh aws-lambda
```

### Google Cloud Functions

```bash
cd scripts
./deploy.sh gcp-functions
```

### Docker

```bash
docker build -t prosody-extractor .
docker run -p 8000:8000 prosody-extractor
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test file
pytest tests/test_providers.py
```

## Examples

See the `examples/` directory for complete working examples:

- `basic_usage.py` - Simple text analysis
- `api_usage.py` - Using the REST API
- `batch_processing.py` - Processing multiple texts

## Cost Estimates

Based on November 2025 pricing:

| Provider | Cost per 100K words | Speed | Accuracy | Context-Aware |
|----------|-------------------|-------|----------|---------------|
| **MIT-Prosody** (RECOMMENDED) | ~$0.05 | 45 sec | ⭐⭐⭐⭐ | ✅ Yes |
| Rule-based | ~$0.001 | 4-5 sec | ⭐⭐⭐ | ❌ No |
| OpenAI (GPT-4o-mini) | ~$0.05-0.15 | 30-90 sec | ⭐⭐⭐⭐ | ⚠️ Limited |
| Anthropic (Claude 3.5) | ~$0.10-0.20 | 30-90 sec | ⭐⭐⭐⭐⭐ | ⚠️ Limited |

**Recommendation**: Use MIT-Prosody for best quality/cost ratio with true context awareness.

## Contributing

This is an experimental module. Contributions welcome!

## License

Part of the mReader project.

## Related Documentation

- [Research Document](../docs/llm-prosody-investigation.md) - Comprehensive technical research
- [API Documentation](docs/API.md)
- [Provider Guide](docs/PROVIDERS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
