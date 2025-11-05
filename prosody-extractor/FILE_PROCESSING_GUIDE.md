# File Processing Guide

Process entire books using file upload instead of raw text.

## Method 1: Command Line (Easiest)

```bash
# Basic usage
python analyze_book.py input.txt output.json

# With custom settings
python analyze_book.py book.txt book.prosody.json \
  --provider kokoro-tts \
  --wpm 250 \
  --sensitivity 0.8 \
  --device cpu

# Human-readable output
python analyze_book.py book.txt book.prosody.txt \
  --format txt

# GPU acceleration (if available)
python analyze_book.py book.txt output.json --device cuda
```

### Command Line Options

- `--provider`: `kokoro-tts` (default), `rule-based`, `openai`, `anthropic`
- `--wpm`: Reading speed (100-1000, default: 250)
- `--sensitivity`: Prosody sensitivity (0.0-1.0, default: 0.8)
- `--format`: `json` or `txt` (auto-detects from extension)
- `--device`: `cpu`, `cuda`, or `mps` (for Kokoro)
- `--voice`: Voice for Kokoro (`af_sky`, `af_bella`, etc.)

### Example

```bash
cd prosody-extractor

# Process a book chapter
python analyze_book.py ../docs/sample-book.txt my-book.prosody.json \
  --provider kokoro-tts \
  --wpm 250 \
  --sensitivity 0.8

# Expected output:
# ✓ Success!
#   Words processed: 15,234
#   Processing time: 45.2s
#   Output file: my-book.prosody.json
#   File size: 2.3 MB
```

## Method 2: API with Postman

### Step 1: Upload File

**Endpoint**: `POST http://localhost:8000/api/v1/analyze-file`

**Request Type**: `form-data`

**Form Fields**:
```
file: [Select your .txt file]
provider: kokoro-tts
wpm: 250
sensitivity: 0.8
format: json
```

### Step 2: Configure in Postman

1. Create new request
2. Set method to `POST`
3. Enter URL: `http://localhost:8000/api/v1/analyze-file`
4. Go to **Body** tab
5. Select **form-data**
6. Add fields:
   - `file`: Change type to "File", click "Select Files", choose your `.txt` file
   - `provider`: Text, value: `kokoro-tts`
   - `wpm`: Text, value: `250`
   - `sensitivity`: Text, value: `0.8`
   - `format`: Text, value: `json` (or `txt`)
7. Click **Send**
8. Click **Save Response** → **Save to a file**

### Postman Screenshot Guide

```
┌─────────────────────────────────────────────────────────┐
│ POST http://localhost:8000/api/v1/analyze-file    [Send]│
├─────────────────────────────────────────────────────────┤
│ Params | Authorization | Headers | Body | Pre-req | ... │
│                                                           │
│ ○ none  ○ form-data  ○ x-www-form-urlencoded            │
│                                                           │
│ KEY          VALUE                  TYPE    DESCRIPTION  │
│ ─────────────────────────────────────────────────────── │
│ file         [Select Files]         File                 │
│ provider     kokoro-tts             Text                 │
│ wpm          250                    Text                 │
│ sensitivity  0.8                    Text                 │
│ format       json                   Text                 │
└─────────────────────────────────────────────────────────┘
```

### Response Headers

The response includes metadata headers:

```
Content-Disposition: attachment; filename=mybook.prosody.json
X-Word-Count: 15234
X-Processing-Time: 45.2
```

## Method 3: curl (Terminal)

```bash
# Upload and download in one command
curl -X POST "http://localhost:8000/api/v1/analyze-file" \
  -F "file=@book.txt" \
  -F "provider=kokoro-tts" \
  -F "wpm=250" \
  -F "sensitivity=0.8" \
  -F "format=json" \
  -o book.prosody.json

# With response headers visible
curl -X POST "http://localhost:8000/api/v1/analyze-file" \
  -F "file=@book.txt" \
  -F "provider=kokoro-tts" \
  -F "wpm=250" \
  -F "sensitivity=0.8" \
  -F "format=json" \
  -O -J -v
```

**Flags**:
- `-F`: Form field
- `-o`: Output filename
- `-O -J`: Use server-suggested filename
- `-v`: Verbose (show headers)

## Output Formats

### JSON Format (Default)

```json
{
  "version": "1.0",
  "method": "kokoro-tts",
  "metadata": {
    "wordCount": 15234,
    "avgWordLength": 4.8,
    "processingTime": 45.2
  },
  "words": [
    {
      "text": "Hello,",
      "index": 0,
      "baseDelay": 240,
      "prosody": {
        "pause": 1.0,
        "pauseAfter": 96,
        "emphasis": "none",
        "tone": "neutral"
      }
    }
  ]
}
```

### TXT Format (Human-Readable)

```
Prosody Analysis Results
========================

File: book.txt
Provider: kokoro-tts
Words: 15234
Processing time: 45.20s

Word Timings:
-------------

    0. Hello,                 240ms +96ms
    1. world!                 312ms +120ms
    2. How                    240ms
    3. are                    240ms
    4. you                    240ms [low]
    5. today?                 480ms +120ms [medium]
```

## Performance Tips

### For Long Books (50k+ words)

1. **Use command line** (simpler, better for automation):
   ```bash
   python analyze_book.py long-book.txt output.json
   ```

2. **Use GPU if available**:
   ```bash
   python analyze_book.py book.txt output.json --device cuda
   ```

3. **Monitor progress** (for very long books):
   ```bash
   python analyze_book.py book.txt output.json 2>&1 | tee processing.log
   ```

### Expected Processing Times

| Book Size | Words    | CPU Time | GPU Time (CUDA) |
|-----------|----------|----------|-----------------|
| Article   | 500      | 2s       | 1s              |
| Chapter   | 5,000    | 15s      | 5s              |
| Novella   | 20,000   | 60s      | 20s             |
| Novel     | 80,000   | 240s     | 80s             |
| Epic      | 200,000+ | 600s+    | 200s+           |

### Memory Usage

- **Rule-based**: Minimal (~50MB)
- **Kokoro TTS CPU**: ~500MB
- **Kokoro TTS GPU**: ~1GB VRAM

## Integration with mreader App

Once you have the `.prosody.json` file:

1. Save it alongside your book file
2. Load it in the mreader app
3. The app will use the pre-computed timings
4. No internet required for reading

### File Structure

```
my-books/
├── chapter-1.txt
├── chapter-1.prosody.json
├── chapter-2.txt
└── chapter-2.prosody.json
```

## Troubleshooting

### "File must be valid UTF-8 text"

Your file has encoding issues. Convert it:

```bash
iconv -f ISO-8859-1 -t UTF-8 input.txt > output.txt
```

### "Out of memory"

Use CPU instead of GPU:

```bash
python analyze_book.py book.txt output.json --device cpu
```

### "Processing is slow"

1. Check if GPU is being used: `--device cuda` or `--device mps`
2. Use smaller chunks: `--chunk-size 500`
3. Use rule-based for faster (but less natural) results:
   ```bash
   python analyze_book.py book.txt output.json --provider rule-based
   ```

## Next Steps

- Process your entire library at once
- Automate with bash scripts
- Pre-process books for offline reading
- Compare providers (Kokoro vs rule-based)
