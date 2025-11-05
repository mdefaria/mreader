"""Providers package initialization."""

from .base import BaseProsodyProvider, ProviderFactory
from .rule_based import RuleBasedProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider

# Register providers
ProviderFactory.register_provider("rule-based", RuleBasedProvider)
ProviderFactory.register_provider("openai", OpenAIProvider)
ProviderFactory.register_provider("anthropic", AnthropicProvider)

__all__ = [
    "BaseProsodyProvider",
    "ProviderFactory",
    "RuleBasedProvider",
    "OpenAIProvider",
    "AnthropicProvider",
]
