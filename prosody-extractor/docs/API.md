# API Documentation

## Overview

The Prosody Extractor API provides endpoints for analyzing text and extracting prosody information (timing, emphasis, tone) suitable for RSVP reading applications.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Currently no authentication is required for local development. For production deployment, implement appropriate authentication (API keys, JWT, etc.).

## Endpoints

### POST /analyze

Analyze text and extract word-level prosody information.

**Request Body:**

```json
{
  "text": "Your text to analyze",
  "provider": "rule-based",
  "options": {
    "wpm": 300,
    "sensitivity": 0.7,
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "max_tokens": 2000
  }
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to analyze (1-500,000 characters) |
| provider | string | No | Provider to use: "rule-based", "openai", "anthropic" (default: "rule-based") |
| options | object | No | Provider-specific options |
| options.wpm | integer | No | Words per minute (100-1000, default: 300) |
| options.sensitivity | float | No | Prosody sensitivity (0.0-1.0, default: 0.7) |
| options.model | string | No | Model to use (provider-specific) |
| options.temperature | float | No | LLM temperature (0.0-2.0) |
| options.max_tokens | integer | No | Max tokens for LLM response |

**Response (200 OK):**

```json
{
  "version": "1.0",
  "method": "rule-based",
  "metadata": {
    "wordCount": 42,
    "avgWordLength": 4.5,
    "totalPauses": 8,
    "emphasisCount": 3,
    "processingTime": 0.023,
    "model": "rule-based-v1.0"
  },
  "words": [
    {
      "text": "Your",
      "index": 0,
      "start": 0,
      "end": 4,
      "pivotIndex": 1,
      "baseDelay": 300,
      "prosody": {
        "pause": 1.0,
        "pauseAfter": 0,
        "emphasis": "none",
        "tone": "neutral",
        "pitch": null,
        "loudness": null
      }
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| version | string | Result format version |
| method | string | Provider used |
| metadata | object | Processing metadata |
| words | array | Array of word objects with prosody data |

**Word Object:**

| Field | Type | Description |
|-------|------|-------------|
| text | string | Word text including punctuation |
| index | integer | Sequential word index (0-based) |
| start | integer | Character start position in original text |
| end | integer | Character end position in original text |
| pivotIndex | integer | Optimal visual fixation point |
| baseDelay | integer | Base display time in milliseconds |
| prosody | object | Prosody information |

**Prosody Object:**

| Field | Type | Description |
|-------|------|-------------|
| pause | float | Multiplier for base delay (1.0 = normal, 2.5 = long) |
| pauseAfter | integer | Additional pause in milliseconds |
| emphasis | string | Emphasis level: "none", "low", "medium", "high" |
| tone | string | Intonation: "neutral", "rising", "falling" |
| pitch | float | Optional pitch in Hz (for TTS) |
| loudness | float | Optional loudness in dB (for TTS) |

**Error Responses:**

**400 Bad Request:**
```json
{
  "detail": "Text cannot be empty"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Analysis failed: [error message]"
}
```

---

### GET /health

Health check endpoint.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "providers": ["rule-based", "openai", "anthropic"]
}
```

---

### GET /providers

List all available prosody extraction providers and their capabilities.

**Response (200 OK):**

```json
{
  "providers": {
    "rule-based": {
      "name": "rule-based",
      "capabilities": {
        "name": "rule-based",
        "requires_api_key": false,
        "supports_streaming": false,
        "max_text_length": 500000,
        "offline": true,
        "cost_per_100k_words": 0.001,
        "avg_processing_time_100k_words": 5.0,
        "accuracy_rating": 3
      }
    },
    "openai": {
      "name": "openai",
      "capabilities": {
        "name": "openai",
        "requires_api_key": true,
        "supports_streaming": false,
        "max_text_length": 500000,
        "offline": false,
        "cost_per_100k_words": 0.10,
        "avg_processing_time_100k_words": 60.0,
        "accuracy_rating": 4
      }
    }
  }
}
```

## Usage Examples

### cURL

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Analyze text with rule-based provider
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world! How are you?",
    "provider": "rule-based",
    "options": {
      "wpm": 300,
      "sensitivity": 0.7
    }
  }'

# Analyze with OpenAI (requires API key in environment)
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The quick brown fox jumps over the lazy dog.",
    "provider": "openai",
    "options": {
      "wpm": 300,
      "model": "gpt-4o-mini",
      "temperature": 0.3
    }
  }'
```

### Python

```python
import requests

# Analyze text
response = requests.post(
    "http://localhost:8000/api/v1/analyze",
    json={
        "text": "Your text here",
        "provider": "rule-based",
        "options": {"wpm": 300, "sensitivity": 0.7}
    }
)

result = response.json()
print(f"Analyzed {result['metadata']['wordCount']} words")
```

### JavaScript

```javascript
// Analyze text
const response = await fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your text here',
    provider: 'rule-based',
    options: {
      wpm: 300,
      sensitivity: 0.7
    }
  })
});

const result = await response.json();
console.log(`Analyzed ${result.metadata.wordCount} words`);
```

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider adding:

- Per-IP rate limiting
- Per-user rate limiting (with authentication)
- Different tiers based on provider (LLM providers should have stricter limits)

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Request successful
- **400 Bad Request**: Invalid input (empty text, invalid options)
- **500 Internal Server Error**: Processing failed

All errors return a JSON object with a `detail` field explaining the error.

## Interactive Documentation

When the server is running, access interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
