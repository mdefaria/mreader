"""Providers package initialization."""

from .base import BaseProsodyProvider, ProviderFactory
from .rule_based import RuleBasedProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .mit_prosody_provider import MITProsodyProvider
from .kokoro_tts_provider import KokoroTTSProvider, KokoroTTSStreamProvider

# Register providers
ProviderFactory.register_provider("rule-based", RuleBasedProvider)
ProviderFactory.register_provider("openai", OpenAIProvider)
ProviderFactory.register_provider("anthropic", AnthropicProvider)
ProviderFactory.register_provider("mit-prosody", MITProsodyProvider)
ProviderFactory.register_provider("kokoro-tts", KokoroTTSProvider)
ProviderFactory.register_provider("kokoro-tts-stream", KokoroTTSStreamProvider)

__all__ = [
    "BaseProsodyProvider",
    "ProviderFactory",
    "RuleBasedProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "MITProsodyProvider",
    "KokoroTTSProvider",
    "KokoroTTSStreamProvider",
]
