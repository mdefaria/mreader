# Provider Guide

This guide explains the different prosody extraction providers and how to use them effectively.

## Overview

The Prosody Extractor supports multiple providers for flexibility and cost optimization:

1. **Rule-Based**: Fast, offline, no API required
2. **OpenAI**: GPT models for context-aware prosody
3. **Anthropic**: Claude models for high-quality analysis

## Rule-Based Provider

### Overview

The rule-based provider uses punctuation, capitalization, and word length heuristics to determine prosody. It doesn't require any API keys and works completely offline.

### Advantages

- ✅ **No API required**: Works without internet
- ✅ **Very fast**: ~5 seconds for 100K words
- ✅ **Near-zero cost**: Only compute costs
- ✅ **Consistent**: Deterministic results
- ✅ **Good accuracy**: 85-95% effective for most texts

### Limitations

- ❌ **No context awareness**: Misses subtle emphasis
- ❌ **Limited to heuristics**: Can't understand sarcasm, emotion
- ❌ **English-focused**: Rules tuned for English

### Usage

```python
from src.core.processor import ProsodyProcessor

processor = ProsodyProcessor(provider="rule-based")
result = processor.analyze(
    text="Hello, world!",
    wpm=300,
    sensitivity=0.7
)
```

### Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| wpm | int | 300 | Words per minute (base reading speed) |
| sensitivity | float | 0.7 | Prosody sensitivity (0.0 = minimal, 1.0 = maximum) |

### Prosody Rules

The rule-based provider applies these heuristics:

**Punctuation Pauses:**
- Period (`.`): 2.5x pause
- Exclamation (`!`): 2.5x pause
- Question (`?`): 2.5x pause, rising tone
- Semicolon (`;`): 2.0x pause
- Colon (`:`): 1.8x pause
- Comma (`,`): 1.5x pause
- Em-dash (`—`): 1.5x pause
- Ellipsis (`…`): 2.0x pause

**Emphasis Detection:**
- ALL CAPS words: High emphasis
- Words starting with quotes: Medium emphasis
- Words between asterisks: Medium emphasis

**Length Adjustments:**
- Words > 10 characters: 1.1x longer display
- Words > 15 characters: 1.2x longer display

**Paragraph Breaks:**
- Gap > 2 characters between words: Add base delay pause

### Best For

- High-volume processing
- Cost-sensitive applications
- Offline/local-first apps
- Real-time processing
- General reading material

---

## OpenAI Provider

### Overview

Uses OpenAI's GPT models to analyze text and generate context-aware prosody information.

### Advantages

- ✅ **Context-aware**: Understands semantic meaning
- ✅ **Handles subtlety**: Detects sarcasm, emotion
- ✅ **Multiple models**: Choose speed vs quality
- ✅ **Well-documented**: Extensive OpenAI documentation

### Limitations

- ❌ **Requires API key**: Must have OpenAI account
- ❌ **Costs money**: ~$0.10 per 100K words
- ❌ **Slower**: 30-90 seconds for 100K words
- ❌ **Rate limits**: Subject to OpenAI rate limits

### Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Set environment variable:
   ```bash
   export OPENAI_API_KEY=your_key_here
   ```
3. Or pass in code:
   ```python
   processor = ProsodyProcessor(
       provider="openai",
       api_key="your_key_here"
   )
   ```

### Usage

```python
from src.core.processor import ProsodyProcessor

processor = ProsodyProcessor(
    provider="openai",
    model="gpt-4o-mini"  # or "gpt-4o"
)

result = processor.analyze(
    text="Your text here",
    wpm=300,
    temperature=0.3,
    max_tokens=2000
)
```

### Models

| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| gpt-4o-mini | Fast | $ | Good | General use |
| gpt-4o | Medium | $$ | Excellent | High quality needed |
| gpt-4-turbo | Medium | $$$ | Excellent | Complex texts |

### Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| model | str | gpt-4o-mini | Model to use |
| temperature | float | 0.3 | Creativity (0.0-2.0) |
| max_tokens | int | 2000 | Max response tokens |
| wpm | int | 300 | Words per minute |

### Cost Estimation

Based on November 2025 pricing:

- **gpt-4o-mini**: ~$0.10 per 100K words
- **gpt-4o**: ~$0.50 per 100K words
- **gpt-4-turbo**: ~$1.00 per 100K words

### Best For

- Literary texts with subtle emotion
- Dialogue-heavy content
- Content requiring nuanced understanding
- When budget allows

---

## Anthropic Provider

### Overview

Uses Anthropic's Claude models for high-quality prosody analysis.

### Advantages

- ✅ **Highest quality**: Best understanding of context
- ✅ **Long context**: Handles very long texts
- ✅ **Thoughtful analysis**: Excellent for complex material
- ✅ **Safety-focused**: Strong content moderation

### Limitations

- ❌ **Requires API key**: Must have Anthropic account
- ❌ **Most expensive**: ~$0.15 per 100K words
- ❌ **Slower**: 30-90 seconds for 100K words
- ❌ **Rate limits**: Subject to Anthropic rate limits

### Setup

1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Set environment variable:
   ```bash
   export ANTHROPIC_API_KEY=your_key_here
   ```
3. Or pass in code:
   ```python
   processor = ProsodyProcessor(
       provider="anthropic",
       api_key="your_key_here"
   )
   ```

### Usage

```python
from src.core.processor import ProsodyProcessor

processor = ProsodyProcessor(
    provider="anthropic",
    model="claude-3-5-sonnet-20241022"
)

result = processor.analyze(
    text="Your text here",
    wpm=300,
    temperature=0.3,
    max_tokens=2000
)
```

### Models

| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| claude-3-5-sonnet | Medium | $$ | Excellent | General use |
| claude-3-5-haiku | Fast | $ | Good | Speed needed |
| claude-3-opus | Slow | $$$ | Best | Highest quality |

### Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| model | str | claude-3-5-sonnet | Model to use |
| temperature | float | 0.3 | Creativity (0.0-1.0) |
| max_tokens | int | 2000 | Max response tokens |
| wpm | int | 300 | Words per minute |

### Cost Estimation

Based on November 2025 pricing:

- **claude-3-5-haiku**: ~$0.05 per 100K words
- **claude-3-5-sonnet**: ~$0.15 per 100K words
- **claude-3-opus**: ~$0.75 per 100K words

### Best For

- Highest quality requirements
- Complex literary analysis
- Academic texts
- Premium features

---

## Choosing a Provider

### Decision Matrix

| Requirement | Recommended Provider |
|-------------|---------------------|
| Offline support | Rule-based |
| Lowest cost | Rule-based |
| Fastest processing | Rule-based |
| Good quality, low cost | Rule-based or OpenAI (gpt-4o-mini) |
| High quality | OpenAI (gpt-4o) or Anthropic (claude-3-5-sonnet) |
| Highest quality | Anthropic (claude-3-opus) |
| Long context (>100K words) | Anthropic |
| Real-time processing | Rule-based |

### Hybrid Approach

For production applications, consider a tiered strategy:

```python
def analyze_with_tiers(text: str) -> ProsodyResult:
    word_count = len(text.split())
    
    # Tier 1: Small texts - rule-based (instant)
    if word_count < 10000:
        processor = ProsodyProcessor(provider="rule-based")
        return processor.analyze(text)
    
    # Tier 2: Medium texts - OpenAI gpt-4o-mini
    elif word_count < 50000:
        processor = ProsodyProcessor(
            provider="openai",
            model="gpt-4o-mini"
        )
        return processor.analyze(text)
    
    # Tier 3: Large texts - consider async processing
    else:
        # Queue for async processing with premium model
        queue_for_processing(text, provider="anthropic")
        # Return rule-based result immediately
        processor = ProsodyProcessor(provider="rule-based")
        return processor.analyze(text)
```

## Error Handling

### API Key Errors

```python
try:
    processor = ProsodyProcessor(provider="openai")
except ValueError as e:
    print(f"Error: {e}")
    # Fall back to rule-based
    processor = ProsodyProcessor(provider="rule-based")
```

### Rate Limit Handling

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
def analyze_with_retry(text: str):
    processor = ProsodyProcessor(provider="openai")
    return processor.analyze(text)
```

### Timeout Handling

```python
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("Analysis timed out")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(60)  # 60 second timeout

try:
    result = processor.analyze(text)
except TimeoutError:
    print("Analysis timed out, falling back to rule-based")
    processor = ProsodyProcessor(provider="rule-based")
    result = processor.analyze(text)
finally:
    signal.alarm(0)  # Cancel alarm
```

## Extending with Custom Providers

To add a new provider:

1. Create a new provider class inheriting from `BaseProsodyProvider`
2. Implement required methods:
   - `analyze()`
   - `get_provider_name()`
   - `validate_config()`
3. Register with the factory:

```python
from src.providers.base import BaseProsodyProvider, ProviderFactory

class CustomProvider(BaseProsodyProvider):
    def analyze(self, text: str, options: AnalysisOptions) -> ProsodyResult:
        # Your implementation
        pass
    
    def get_provider_name(self) -> str:
        return "custom"
    
    def validate_config(self) -> bool:
        return True

# Register
ProviderFactory.register_provider("custom", CustomProvider)

# Use
processor = ProsodyProcessor(provider="custom")
```

## Performance Tips

1. **Cache results**: Don't re-analyze the same text
2. **Batch processing**: Process multiple texts in parallel
3. **Async processing**: Use async/await for non-blocking calls
4. **Stream processing**: For very long texts, consider chunking
5. **Pre-compute popular texts**: Cache analysis for frequently-used texts

## Support

For provider-specific issues:

- **Rule-based**: Check GitHub issues
- **OpenAI**: [OpenAI Support](https://help.openai.com/)
- **Anthropic**: [Anthropic Support](https://support.anthropic.com/)
