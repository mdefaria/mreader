# Kokoro TTS API - Postman Guide

Complete guide for testing the Prosody Extractor API with Postman.

## Quick Start

### 1. Start the API Server

```bash
cd prosody-extractor
python src/main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Test in Browser

Open http://localhost:8000 in your browser. You should see:
```json
{
  "name": "Prosody Extractor API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/api/v1/health"
}
```

### 3. View Interactive API Docs

Open http://localhost:8000/docs for Swagger UI documentation.

## Postman Collection

### Base URL

```
http://localhost:8000
```

---

## 🔍 Endpoint 1: Health Check

**Quick test to verify the server is running.**

### Request

```
GET http://localhost:8000/api/v1/health
```

### Response

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "providers": [
    "rule-based",
    "openai",
    "anthropic",
    "mit-prosody",
    "kokoro-tts",
    "kokoro-tts-stream"
  ]
}
```

### Postman Setup

1. Method: `GET`
2. URL: `http://localhost:8000/api/v1/health`
3. Click **Send**

---

## 📋 Endpoint 2: List Providers

**Get detailed information about all available providers.**

### Request

```
GET http://localhost:8000/api/v1/providers
```

### Response

```json
{
  "providers": {
    "kokoro-tts": {
      "name": "kokoro-tts",
      "offline": true,
      "context_aware": true,
      "natural_timing": true,
      "cost_per_100k_words": 0.0,
      "avg_processing_time_100k_words": 120.0,
      "accuracy_rating": 5
    },
    "rule-based": {
      "name": "rule-based",
      "offline": true,
      "fast": true,
      "cost_per_100k_words": 0.0
    }
  }
}
```

### Postman Setup

1. Method: `GET`
2. URL: `http://localhost:8000/api/v1/providers`
3. Click **Send**

---

## 🎯 Endpoint 3: Analyze Text (Kokoro TTS)

**Extract word-level timing using Kokoro TTS.**

### Request

```
POST http://localhost:8000/api/v1/analyze
Content-Type: application/json
```

### Body (JSON)

```json
{
  "text": "Hello, world! How are you today?",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 250,
    "sensitivity": 0.8,
    "device": "cpu",
    "voice": "af_heart"
  }
}
```

### Response

```json
{
  "method": "kokoro-tts",
  "metadata": {
    "wordCount": 6,
    "avgWordLength": 4.33,
    "totalPauses": 2,
    "emphasisCount": 1,
    "processingTime": 0.45,
    "model": "kokoro-tts-82m-a"
  },
  "words": [
    {
      "text": "Hello,",
      "index": 0,
      "start": 0,
      "end": 6,
      "pivotIndex": 2,
      "baseDelay": 336,
      "prosody": {
        "pause": 1.2,
        "pauseAfter": 60,
        "emphasis": "low",
        "tone": "neutral"
      }
    },
    {
      "text": "world!",
      "index": 1,
      "start": 7,
      "end": 13,
      "pivotIndex": 2,
      "baseDelay": 312,
      "prosody": {
        "pause": 1.1,
        "pauseAfter": 120,
        "emphasis": "medium",
        "tone": "falling"
      }
    },
    {
      "text": "How",
      "index": 2,
      "start": 14,
      "end": 17,
      "pivotIndex": 1,
      "baseDelay": 240,
      "prosody": {
        "pause": 1.0,
        "pauseAfter": 0,
        "emphasis": "none",
        "tone": "neutral"
      }
    }
    // ... more words
  ]
}
```

### Postman Setup

1. Method: `POST`
2. URL: `http://localhost:8000/api/v1/analyze`
3. Headers:
   - `Content-Type`: `application/json`
4. Body → raw → JSON:
   ```json
   {
     "text": "Hello, world! How are you today?",
     "provider": "kokoro-tts",
     "options": {
       "wpm": 250,
       "sensitivity": 0.8,
       "device": "cpu",
       "voice": "af_heart"
     }
   }
   ```
5. Click **Send**

---

## 📚 Example 4: Analyze Longer Text

**Process a paragraph with natural timing.**

### Request Body

```json
{
  "text": "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 300,
    "sensitivity": 0.7,
    "device": "cpu"
  }
}
```

### Expected Response

- `wordCount`: ~70 words
- `processingTime`: ~2-5 seconds (CPU)
- All words with natural timing and pauses

---

## 🚀 Example 5: Rule-Based (Fastest)

**Use rule-based method for instant results.**

### Request Body

```json
{
  "text": "The quick brown fox jumps over the lazy dog.",
  "provider": "rule-based",
  "options": {
    "wpm": 300,
    "sensitivity": 0.7
  }
}
```

### Response Time

- Processing: <0.1 seconds
- Good for testing and fast processing

---

## 🎨 Example 6: Different Voices

**Try different Kokoro voices for timing variation.**

### Female Voices

```json
{
  "text": "This is a test with different voices.",
  "provider": "kokoro-tts",
  "options": {
    "voice": "af_bella",  // More expressive
    "wpm": 250,
    "device": "cpu"
  }
}
```

Available voices:
- `af_heart` - Warm, natural (default)
- `af_bella` - Expressive, dynamic
- `af_jessica` - Professional, clear
- `af_nicole` - Friendly
- `af_sarah` - Clear enunciation

### Male Voices

```json
{
  "text": "This is a test with a male voice.",
  "provider": "kokoro-tts",
  "options": {
    "voice": "am_adam",  // Deep, authoritative
    "wpm": 250,
    "device": "cpu"
  }
}
```

Available male voices:
- `am_adam` - Deep, authoritative
- `am_michael` - Conversational, warm

---

## 🔧 Configuration Options

### Provider Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `device` | string | `"auto"` | Device: `"cpu"`, `"cuda"`, `"mps"`, `"auto"` |
| `voice` | string | `"af_heart"` | Voice ID for timing |
| `speed` | float | `1.0` | Speech speed modifier (0.5-2.0) |

### Analysis Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wpm` | integer | `250` | Target reading speed (100-1000) |
| `sensitivity` | float | `0.8` | How much to respect TTS timing (0.0-1.0) |

### Example with All Options

```json
{
  "text": "Your text here",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 300,
    "sensitivity": 0.9,
    "device": "cpu",
    "voice": "af_bella",
    "speed": 1.1
  }
}
```

---

## 🧪 Testing Workflow

### 1. Basic Test

```bash
# Start server
cd prosody-extractor
python src/main.py
```

Postman:
```
GET http://localhost:8000/api/v1/health
```

### 2. Short Text Test

```json
POST http://localhost:8000/api/v1/analyze

{
  "text": "Hello, world!",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 250,
    "device": "cpu"
  }
}
```

### 3. Paragraph Test

```json
POST http://localhost:8000/api/v1/analyze

{
  "text": "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 300,
    "device": "cpu"
  }
}
```

### 4. Performance Test

```json
POST http://localhost:8000/api/v1/analyze

{
  "text": "Your long text here (500+ words)",
  "provider": "kokoro-tts",
  "options": {
    "wpm": 300,
    "device": "cpu"
  }
}
```

---

## 📊 Response Structure

### Success Response

```json
{
  "method": "kokoro-tts",
  "metadata": {
    "wordCount": 6,              // Total words processed
    "avgWordLength": 4.33,       // Average word length
    "totalPauses": 2,            // Words with pauses
    "emphasisCount": 1,          // Emphasized words
    "processingTime": 0.45,      // Seconds
    "model": "kokoro-tts-82m-a"  // Model identifier
  },
  "words": [
    {
      "text": "Hello,",          // Word text
      "index": 0,               // Word position
      "start": 0,               // Character start position
      "end": 6,                 // Character end position
      "pivotIndex": 2,          // Optimal fixation point
      "baseDelay": 336,         // Base duration in ms
      "prosody": {
        "pause": 1.2,           // Duration multiplier
        "pauseAfter": 60,       // Silence after word (ms)
        "emphasis": "low",      // none/low/medium/high
        "tone": "neutral"       // neutral/rising/falling
      }
    }
    // ... more words
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "detail": "Invalid provider: nonexistent"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "detail": "Analysis failed: CUDA out of memory"
}
```

---

## 🎯 Postman Collection Template

Save this as a Postman collection:

```json
{
  "info": {
    "name": "Prosody Extractor API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/api/v1/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "health"]
        }
      }
    },
    {
      "name": "List Providers",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/api/v1/providers",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "providers"]
        }
      }
    },
    {
      "name": "Analyze - Kokoro TTS",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"text\": \"Hello, world! How are you today?\",\n  \"provider\": \"kokoro-tts\",\n  \"options\": {\n    \"wpm\": 250,\n    \"sensitivity\": 0.8,\n    \"device\": \"cpu\",\n    \"voice\": \"af_heart\"\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/analyze",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "analyze"]
        }
      }
    },
    {
      "name": "Analyze - Rule Based",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"text\": \"The quick brown fox jumps over the lazy dog.\",\n  \"provider\": \"rule-based\",\n  \"options\": {\n    \"wpm\": 300,\n    \"sensitivity\": 0.7\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/analyze",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "analyze"]
        }
      }
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Server Won't Start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Use different port
PORT=8001 python src/main.py
```

### Connection Refused

- Verify server is running: `ps aux | grep python`
- Check URL: `http://localhost:8000` (not `https`)
- Try `http://127.0.0.1:8000`

### Slow Response (First Request)

First Kokoro request downloads the model (~165MB):
- Expected: 1-2 minutes first time
- Subsequent requests: 2-5 seconds

### CUDA Out of Memory

Change device to CPU:
```json
{
  "options": {
    "device": "cpu"
  }
}
```

### Import Errors

```bash
cd prosody-extractor
pip install -r requirements.txt
```

---

## 📖 Additional Resources

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Full Documentation**: `docs/KOKORO_TTS_INTEGRATION.md`
- **Quick Start**: `docs/KOKORO_QUICKSTART.md`

---

## 🎬 Quick Copy-Paste Examples

### cURL Commands

```bash
# Health check
curl http://localhost:8000/api/v1/health

# List providers
curl http://localhost:8000/api/v1/providers

# Analyze with Kokoro TTS
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "provider": "kokoro-tts",
    "options": {
      "wpm": 250,
      "device": "cpu"
    }
  }'

# Analyze with Rule-Based (fast)
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "provider": "rule-based",
    "options": {
      "wpm": 300
    }
  }'
```

### Python Client

```python
import requests

# Health check
response = requests.get("http://localhost:8000/api/v1/health")
print(response.json())

# Analyze text
data = {
    "text": "Hello, world! How are you today?",
    "provider": "kokoro-tts",
    "options": {
        "wpm": 250,
        "sensitivity": 0.8,
        "device": "cpu"
    }
}
response = requests.post("http://localhost:8000/api/v1/analyze", json=data)
result = response.json()

# Print word timing
for word in result["words"]:
    duration = word["baseDelay"] * word["prosody"]["pause"]
    print(f"{word['text']}: {duration:.0f}ms")
```

### JavaScript/Fetch

```javascript
// Health check
fetch('http://localhost:8000/api/v1/health')
  .then(res => res.json())
  .then(data => console.log(data));

// Analyze text
fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Hello, world!",
    provider: "kokoro-tts",
    options: {
      wpm: 250,
      device: "cpu"
    }
  })
})
  .then(res => res.json())
  .then(data => {
    data.words.forEach(word => {
      const duration = word.baseDelay * word.prosody.pause;
      console.log(`${word.text}: ${duration}ms`);
    });
  });
```

---

**Happy Testing! 🚀**
