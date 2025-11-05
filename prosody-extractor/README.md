# Prosody Extractor

A standalone Python module for extracting and generating prosody information (intonation, rhythm, stress, pauses) from text using Large Language Models (LLMs) or rule-based approaches. Designed for RSVP (Rapid Serial Visual Presentation) reading applications.

## Features

- **Provider-Agnostic Architecture**: Easy switching between LLM providers (OpenAI, Anthropic, local models)
- **Multiple Processing Methods**:
  - Rule-based (fast, no API required, ~95% effective)
  - LLM-enhanced (OpenAI, Anthropic)
  - Extensible for custom providers
- **Local Development First**: Run and test locally before deploying to cloud
- **Cloud-Ready**: Structured for deployment as AWS Lambda, Google Cloud Functions, or other serverless platforms
- **FastAPI Server**: Built-in REST API for local testing and production deployment
- **Offline Capable**: Rule-based analyzer works without internet connection

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

#### Rule-Based Analysis (No API Required)

```python
from src.core.processor import ProsodyProcessor

# Initialize with rule-based method
processor = ProsodyProcessor(provider="rule-based")

# Analyze text
text = "Hello, world! How are you doing today?"
result = processor.analyze(text)

print(result)
```

#### LLM-Enhanced Analysis

```python
from src.core.processor import ProsodyProcessor

# Initialize with OpenAI
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

# In another terminal, make a request
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

| Provider | Cost per 100K words | Speed | Accuracy |
|----------|-------------------|-------|----------|
| Rule-based | ~$0.001 | 4-5 sec | ⭐⭐⭐ |
| OpenAI (GPT-4o-mini) | ~$0.05-0.15 | 30-90 sec | ⭐⭐⭐⭐ |
| Anthropic (Claude 3.5) | ~$0.10-0.20 | 30-90 sec | ⭐⭐⭐⭐⭐ |

## Contributing

This is an experimental module. Contributions welcome!

## License

Part of the mReader project.

## Related Documentation

- [Research Document](../docs/llm-prosody-investigation.md) - Comprehensive technical research
- [API Documentation](docs/API.md)
- [Provider Guide](docs/PROVIDERS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
