"""EPUB parsing utilities for prosody extraction."""

import re
from typing import Optional
from html.parser import HTMLParser


class HTMLTextExtractor(HTMLParser):
    """Extract plain text from HTML content."""
    
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.in_script = False
        self.in_style = False
    
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        elif tag == 'style':
            self.in_style = True
        elif tag in ['p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            # Add paragraph breaks
            self.text_parts.append('\n\n')
    
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
        elif tag == 'style':
            self.in_style = False
    
    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            # Clean up whitespace but preserve paragraph structure
            text = data.strip()
            if text:
                self.text_parts.append(text + ' ')
    
    def get_text(self) -> str:
        """Get extracted text."""
        text = ''.join(self.text_parts)
        # Clean up excessive whitespace
        text = re.sub(r' +', ' ', text)
        text = re.sub(r'\n\n\n+', '\n\n', text)
        return text.strip()


def extract_text_from_epub(file_content: bytes) -> str:
    """
    Extract plain text from EPUB file.
    
    Args:
        file_content: Raw EPUB file bytes
        
    Returns:
        Extracted plain text
        
    Raises:
        ValueError: If EPUB is invalid or empty
    """
    try:
        import ebooklib
        from ebooklib import epub
    except ImportError:
        raise ImportError(
            "ebooklib is required for EPUB parsing. "
            "Install it with: pip install ebooklib"
        )
    
    try:
        # Load EPUB from bytes
        import io
        book = epub.read_epub(io.BytesIO(file_content))
        
        # Extract text from all document items
        text_parts = []
        
        for item in book.get_items():
            # Only process document items (not images, CSS, etc.)
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                # Get HTML content
                html_content = item.get_content().decode('utf-8', errors='ignore')
                
                # Extract text from HTML
                extractor = HTMLTextExtractor()
                extractor.feed(html_content)
                text = extractor.get_text()
                
                if text:
                    text_parts.append(text)
        
        # Combine all text
        full_text = '\n\n'.join(text_parts)
        
        if not full_text.strip():
            raise ValueError("EPUB file contains no readable text")
        
        return full_text
        
    except Exception as e:
        raise ValueError(f"Failed to parse EPUB: {str(e)}")


def extract_metadata_from_epub(file_content: bytes) -> dict:
    """
    Extract metadata from EPUB file.
    
    Args:
        file_content: Raw EPUB file bytes
        
    Returns:
        Dictionary with title, author, etc.
    """
    try:
        import ebooklib
        from ebooklib import epub
    except ImportError:
        return {}
    
    try:
        import io
        book = epub.read_epub(io.BytesIO(file_content))
        
        metadata = {
            'title': book.get_metadata('DC', 'title'),
            'author': book.get_metadata('DC', 'creator'),
            'language': book.get_metadata('DC', 'language'),
            'publisher': book.get_metadata('DC', 'publisher'),
        }
        
        # Clean up metadata (ebooklib returns lists)
        for key, value in metadata.items():
            if value and isinstance(value, list) and len(value) > 0:
                # Extract first item and get string value
                metadata[key] = str(value[0][0]) if isinstance(value[0], tuple) else str(value[0])
            else:
                metadata[key] = None
        
        return metadata
        
    except Exception:
        return {}


def is_epub_file(filename: str) -> bool:
    """Check if filename indicates an EPUB file."""
    return filename.lower().endswith('.epub')
