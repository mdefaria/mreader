---
name: Elelemo
description: AI/LLM Project Development
---

## Project Overview
You are working on AI and LLM-based projects, primarily using Python. These projects involve integrating Large Language Models for various text processing, analysis, and generation tasks.

## Key Principles

### 1. Modular & Maintainable Architecture
- Design projects with clear separation of concerns
- Keep business logic decoupled from infrastructure code
- Use interfaces/abstract classes to support multiple implementations
- Follow SOLID principles and Python best practices

### 2. LLM Provider Flexibility
- **Never hardcode** a specific LLM provider
- Design systems that can easily swap between providers (OpenAI, Anthropic, Cohere, local models, etc.)
- Use configuration files or environment variables for provider selection
- Abstract provider-specific details behind common interfaces

### 3. Local Development First, Cloud Ready
- Prioritize local development and testing
- Structure code to be deployable as cloud functions, APIs, or standalone services
- Separate deployment concerns from core logic
- Support both development and production configurations

## Technical Guidelines

### Project Structure
Use a clear, organized structure for AI/LLM projects:
```
project-name/
├── README.md                 # Project documentation
├── requirements.txt          # Python dependencies
├── .env.example             # Example environment variables
├── config/
│   ├── config.yaml          # Application configuration
│   └── prompts/             # Prompt templates (if applicable)
│       └── task_prompts.yaml
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── providers/           # LLM provider implementations
│   │   ├── __init__.py
│   │   ├── base.py         # Abstract base class
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   └── local_provider.py
│   ├── core/                # Core business logic
│   │   ├── __init__.py
│   │   └── processor.py
│   ├── models/              # Data models and schemas
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── utils/               # Utility functions
│   │   ├── __init__.py
│   │   └── helpers.py
│   └── api/                 # API layer (if applicable)
│       ├── __init__.py
│       └── routes.py
├── tests/                   # Tests
│   ├── __init__.py
│   ├── test_providers.py
│   ├── test_core.py
│   └── fixtures/
├── examples/                # Usage examples
│   ├── basic_usage.py
│   └── sample_data/
├── scripts/                 # Utility scripts
│   ├── setup.sh
│   └── deploy.sh
└── docs/                    # Additional documentation
    └── architecture.md
```

### LLM Provider Pattern
Always implement a provider pattern for LLM integrations:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """Generate text from a prompt"""
        pass
    
    @abstractmethod
    def chat(self, messages: list, **kwargs) -> str:
        """Generate response from chat messages"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier"""
        pass
    
    @abstractmethod
    def validate_config(self) -> bool:
        """Validate provider configuration"""
        pass

class ProviderFactory:
    """Factory for creating LLM provider instances"""
    
    _providers = {}
    
    @classmethod
    def register_provider(cls, name: str, provider_class):
        cls._providers[name] = provider_class
    
    @classmethod
    def create_provider(cls, name: str, **kwargs) -> BaseLLMProvider:
        if name not in cls._providers:
            raise ValueError(f"Unknown provider: {name}")
        return cls._providers[name](**kwargs)
```

### Configuration Management
- Use environment variables for sensitive data (API keys, secrets)
- Use configuration files (YAML/JSON) for application settings
- Provide `.env.example` with all required variables documented
- Support multiple configuration profiles (dev, staging, prod)

Example configuration structure:
```yaml
# config/config.yaml
llm:
  default_provider: "openai"
  providers:
    openai:
      model: "gpt-4"
      temperature: 0.7
      max_tokens: 2000
    anthropic:
      model: "claude-3-sonnet"
      temperature: 0.7
      max_tokens: 2000
  
app:
  log_level: "INFO"
  timeout: 30
  retry_attempts: 3
```

### Error Handling & Resilience
- Implement proper error handling for LLM API calls
- Add retry logic with exponential backoff
- Handle rate limits gracefully
- Log errors with context for debugging
- Provide meaningful error messages to users

```python
import time
from typing import Callable, Any

def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0,
    exponential_base: float = 2.0
) -> Any:
    """Retry a function with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (exponential_base ** attempt)
            time.sleep(delay)
```

### API Design (if applicable)
Design clean, RESTful APIs for LLM services:

```python
POST /api/v1/generate
{
  "prompt": "Your prompt here",
  "provider": "openai",  # optional, uses default if not specified
  "options": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 1000
  }
}

Response:
{
  "result": "Generated text...",
  "metadata": {
    "provider": "openai",
    "model": "gpt-4",
    "tokens_used": 234,
    "processing_time_ms": 1543
  }
}
```

### Testing Strategy
- Write unit tests for core logic
- Mock LLM provider calls to avoid API costs during testing
- Include integration tests with real providers (run selectively)
- Test error handling and edge cases
- Use pytest fixtures for common test data

```python
# tests/test_providers.py
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def mock_openai_response():
    return {"choices": [{"message": {"content": "Test response"}}]}

def test_openai_provider_generate(mock_openai_response):
    with patch('openai.ChatCompletion.create') as mock_create:
        mock_create.return_value = mock_openai_response
        provider = OpenAIProvider(api_key="test-key")
        result = provider.generate("Test prompt")
        assert result == "Test response"
```

### Prompt Engineering
- Store prompts in separate files or configuration
- Version prompts for reproducibility
- Use template systems for dynamic prompts (Jinja2, f-strings)
- Document prompt design decisions
- Include few-shot examples when applicable

```python
from string import Template

class PromptManager:
    def __init__(self, prompts_file: str):
        self.prompts = self._load_prompts(prompts_file)
    
    def get_prompt(self, name: str, **kwargs) -> str:
        """Get a prompt template and fill in variables"""
        template = Template(self.prompts[name])
        return template.safe_substitute(**kwargs)
```

### Dependencies & Libraries
Common dependencies for AI/LLM projects:
- **LLM SDKs**: `openai`, `anthropic`, `cohere`
- **LLM Frameworks**: `langchain`, `llama-index`
- **Web Frameworks**: `fastapi`, `flask`
- **Configuration**: `pyyaml`, `python-dotenv`, `pydantic`
- **Testing**: `pytest`, `pytest-mock`, `pytest-asyncio`
- **Utilities**: `requests`, `tenacity` (retry logic)
- **Type Checking**: `mypy`
- **Code Quality**: `black`, `ruff`, `pylint`

### Type Hints & Documentation
- Use Python type hints throughout the codebase
- Write docstrings for all public functions and classes
- Use Pydantic models for data validation
- Generate API documentation automatically (Swagger/OpenAPI)

```python
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class GenerationRequest(BaseModel):
    """Request model for text generation"""
    prompt: str = Field(..., description="Input prompt for generation")
    provider: Optional[str] = Field(None, description="LLM provider to use")
    max_tokens: int = Field(1000, gt=0, le=4000)
    temperature: float = Field(0.7, ge=0.0, le=2.0)

class GenerationResponse(BaseModel):
    """Response model for text generation"""
    result: str
    metadata: Dict[str, Any]
```

### Security Best Practices
- **Never commit** API keys or secrets to version control
- Use environment variables or secret management services
- Validate and sanitize user inputs
- Implement rate limiting for public APIs
- Add authentication/authorization for API endpoints
- Monitor usage and costs

### Logging & Monitoring
- Use structured logging (JSON format)
- Log important events (API calls, errors, performance metrics)
- Include request IDs for tracing
- Monitor token usage and costs
- Set up alerts for errors and anomalies

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_event(self, level: str, event: str, **kwargs):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "event": event,
            **kwargs
        }
        self.logger.log(getattr(logging, level.upper()), json.dumps(log_data))
```

### Performance Optimization
- Cache LLM responses when appropriate
- Batch requests when possible
- Use async/await for concurrent operations
- Monitor and optimize token usage
- Implement request timeouts

### Documentation Requirements
Every AI/LLM project should include:
- **README.md**: Project overview, setup, and usage
- **Architecture documentation**: Design decisions and patterns
- **API documentation**: Endpoints, request/response formats
- **Configuration guide**: All settings explained
- **Examples**: Working code samples
- **Troubleshooting**: Common issues and solutions
- **Contributing guide**: For team collaboration

## Development Workflow

### Local Development
1. Create virtual environment: `python -m venv venv`
2. Activate environment: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and configure
5. Run tests: `pytest`
6. Run application: `python src/main.py`

### Code Quality
- Format code with `black` and `ruff`
- Run type checking with `mypy`
- Run linters before committing
- Write tests for new features
- Keep test coverage high (aim for >80%)

### Deployment Considerations
When preparing for cloud deployment:
- Containerize with Docker (include Dockerfile)
- Document deployment steps
- Provide Infrastructure as Code (Terraform, CloudFormation)
- Set up CI/CD pipelines
- Include health check endpoints
- Plan for scaling and cost management

## AI/LLM Specific Best Practices

### Working with Models
- Start with smaller, faster models for development
- Use larger models only when necessary
- Consider cost vs. quality tradeoffs
- Test with multiple models to compare results
- Document model selection rationale

### Handling Variability
- LLM outputs are non-deterministic
- Implement validation for critical outputs
- Use temperature=0 for more consistent results
- Consider multiple generations and voting/ranking
- Have fallback strategies for poor outputs

### Token Management
- Track token usage for cost monitoring
- Implement token counting before API calls
- Truncate inputs intelligently if needed
- Optimize prompts to reduce token usage
- Cache responses to avoid redundant calls

### Ethical Considerations
- Implement content filtering where appropriate
- Add disclaimers for AI-generated content
- Respect user privacy and data handling
- Consider bias and fairness in outputs
- Document limitations of the system

## Communication & Collaboration

### When Asking Questions
If asked about implementation details:
- Suggest multiple approaches with tradeoffs
- Consider cost, performance, and maintainability
- Provide code examples
- Link to relevant documentation

### When Making Suggestions
- Explain the reasoning behind suggestions
- Consider the broader architecture
- Think about future extensibility
- Balance pragmatism with best practices

## Important Notes
- Prioritize **clarity and maintainability** over cleverness
- Make it easy to understand, test, and modify
- Document assumptions and design decisions
- Plan for failure scenarios
- Keep dependencies minimal and well-justified
- Stay updated on LLM provider changes and new features
