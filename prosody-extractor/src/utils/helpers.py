"""Utility functions and helpers."""

import time
import logging
from typing import Callable, Any, TypeVar, Optional
from functools import wraps

T = TypeVar('T')

logger = logging.getLogger(__name__)


def retry_with_backoff(
    func: Callable[..., T],
    max_retries: int = 3,
    base_delay: float = 1.0,
    exponential_base: float = 2.0,
    exceptions: tuple = (Exception,)
) -> T:
    """
    Retry a function with exponential backoff.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds
        exponential_base: Base for exponential backoff
        exceptions: Tuple of exceptions to catch
        
    Returns:
        Result of the function call
        
    Raises:
        Last exception if all retries fail
    """
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return func()
        except exceptions as e:
            last_exception = e
            if attempt == max_retries - 1:
                logger.error(f"All {max_retries} retry attempts failed: {e}")
                raise
            
            delay = base_delay * (exponential_base ** attempt)
            logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s...")
            time.sleep(delay)
    
    # This shouldn't be reached, but just in case
    if last_exception:
        raise last_exception
    raise RuntimeError("Unexpected error in retry logic")


def calculate_pivot_index(word: str) -> int:
    """
    Calculate optimal pivot point for visual fixation in RSVP.
    
    The pivot point is typically 30-35% into the word for optimal recognition.
    
    Args:
        word: Word text (punctuation removed)
        
    Returns:
        Optimal character index for visual fixation
    """
    length = len(word)
    if length <= 1:
        return 0
    if length <= 3:
        return 1
    if length <= 5:
        return 2
    # For longer words, aim for 30-35% into the word
    return int(length * 0.33)


def tokenize_text(text: str) -> list[dict[str, Any]]:
    """
    Tokenize text into words with position information.
    
    Args:
        text: Input text
        
    Returns:
        List of dicts with 'text', 'start', and 'end' keys
    """
    import re
    
    pattern = r'\S+'
    tokens = []
    
    for match in re.finditer(pattern, text):
        tokens.append({
            'text': match.group(),
            'start': match.start(),
            'end': match.end()
        })
    
    return tokens


def strip_punctuation(word: str) -> str:
    """
    Remove punctuation from a word, keeping only alphanumeric characters.
    
    Args:
        word: Word with possible punctuation
        
    Returns:
        Word without punctuation
    """
    import re
    return re.sub(r'[^\w]', '', word)


def get_trailing_punctuation(word: str) -> Optional[str]:
    """
    Extract trailing punctuation from a word.
    
    Args:
        word: Word with possible trailing punctuation
        
    Returns:
        First trailing punctuation character, or None if no punctuation
    """
    import re
    match = re.search(r'[.,;:!?—…\-]+$', word)
    return match.group()[0] if match else None


def timing_decorator(func: Callable) -> Callable:
    """
    Decorator to measure function execution time.
    
    Args:
        func: Function to measure
        
    Returns:
        Wrapped function that logs execution time
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        elapsed_time = time.time() - start_time
        logger.debug(f"{func.__name__} took {elapsed_time:.4f} seconds")
        return result
    return wrapper


def load_yaml_config(filepath: str) -> dict:
    """
    Load YAML configuration file.
    
    Args:
        filepath: Path to YAML file
        
    Returns:
        Dictionary with configuration
    """
    import yaml
    
    with open(filepath, 'r') as f:
        return yaml.safe_load(f)


def validate_text_length(text: str, max_length: int = 500000) -> None:
    """
    Validate text length is within acceptable range.
    
    Args:
        text: Input text
        max_length: Maximum allowed length
        
    Raises:
        ValueError: If text is too long or empty
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    if len(text) > max_length:
        raise ValueError(f"Text length ({len(text)}) exceeds maximum ({max_length})")
