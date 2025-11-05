"""FastAPI routes for prosody extraction API."""

import logging
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from ..models.schemas import AnalysisRequest, ProsodyResult, HealthResponse
from ..core.processor import ProsodyProcessor
from ..utils.epub_parser import extract_text_from_epub, extract_metadata_from_epub, is_epub_file

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=ProsodyResult, status_code=status.HTTP_200_OK)
async def analyze_text(request: AnalysisRequest) -> ProsodyResult:
    """
    Analyze text and extract prosody information.
    
    Args:
        request: Analysis request with text and options
        
    Returns:
        ProsodyResult with word-level prosody data
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        # Extract options
        options = request.options or {}
        
        # Separate provider initialization options from analysis options
        provider_options = {k: v for k, v in options.items() 
                          if k in ['model', 'temperature', 'max_tokens']}
        analysis_params = {
            'wpm': options.get('wpm', 300),
            'sensitivity': options.get('sensitivity', 0.7)
        }
        
        # Initialize processor with requested provider
        processor = ProsodyProcessor(
            provider=request.provider,
            **provider_options
        )
        
        # Analyze text
        result = processor.analyze(
            text=request.text,
            **analysis_params
        )
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns:
        Health status and available providers
    """
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        providers=ProsodyProcessor.list_providers()
    )


@router.get("/providers")
async def list_providers() -> dict:
    """
    List all available prosody extraction providers.
    
    Returns:
        Dictionary with provider information
    """
    providers = {}
    
    for provider_name in ProsodyProcessor.list_providers():
        try:
            processor = ProsodyProcessor(provider=provider_name)
            info = processor.get_provider_info()
            providers[provider_name] = info
        except Exception as e:
            logger.warning(f"Could not get info for provider {provider_name}: {e}")
            providers[provider_name] = {
                "name": provider_name,
                "error": str(e)
            }
    
    return {"providers": providers}


@router.post("/analyze-file", status_code=status.HTTP_200_OK)
async def analyze_file(
    file: UploadFile = File(..., description="Text or EPUB file to analyze"),
    provider: str = Form(default="kokoro-tts", description="Provider to use"),
    wpm: int = Form(default=300, ge=100, le=1000, description="Words per minute"),
    sensitivity: float = Form(default=0.8, ge=0.0, le=1.0, description="Prosody sensitivity"),
    format: str = Form(default="json", description="Output format: json or txt")
):
    """
    Analyze a text or EPUB file and return prosody data as a downloadable file.
    
    This endpoint is optimized for processing entire books/long texts.
    Supports both plain text (.txt) and EPUB (.epub) formats.
    
    Args:
        file: Text or EPUB file to process
        provider: Prosody provider to use (kokoro-tts recommended for books)
        wpm: Target reading speed in words per minute
        sensitivity: Prosody sensitivity (0.0-1.0)
        format: Output format (json or txt)
        
    Returns:
        FileResponse with prosody data
        
    Example (curl):
        curl -X POST "http://localhost:8000/api/v1/analyze-file" \\
             -F "file=@book.epub" \\
             -F "provider=kokoro-tts" \\
             -F "wpm=250" \\
             -F "sensitivity=0.8" \\
             -F "format=json" \\
             -O -J
    """
    try:
        # Read file content
        content = await file.read()
        
        # Check if it's an EPUB file
        if file.filename and is_epub_file(file.filename):
            logger.info(f"Processing EPUB file: {file.filename}")
            try:
                # Extract text from EPUB
                text = extract_text_from_epub(content)
                metadata = extract_metadata_from_epub(content)
                logger.info(f"EPUB metadata: {metadata}")
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid EPUB file: {str(e)}"
                )
            except ImportError as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        else:
            # Plain text file
            logger.info(f"Processing text file: {file.filename}")
            try:
                text = content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File must be valid UTF-8 text or EPUB format"
                )
            metadata = {}
        
        if not text or not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty or contains no text"
            )
        
        logger.info(f"Extracted {len(text)} characters (~{len(text.split())} words) with {provider}")
        
        # Initialize processor
        processor = ProsodyProcessor(provider=provider)
        
        # Analyze text
        result = processor.analyze(
            text=text,
            wpm=wpm,
            sensitivity=sensitivity
        )
        
        # Generate output filename
        input_name = Path(file.filename).stem if file.filename else "output"
        output_filename = f"{input_name}.prosody.{format}"
        
        # Create temporary output file
        import tempfile
        temp_dir = Path(tempfile.gettempdir())
        output_path = temp_dir / output_filename
        
        if format == "json":
            # Write JSON output with optional metadata
            output_data = result.model_dump()
            if metadata:
                output_data['epub_metadata'] = metadata
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            media_type = "application/json"
            
        else:  # txt format
            # Write human-readable text format
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(f"Prosody Analysis Results\n")
                f.write(f"========================\n\n")
                f.write(f"File: {file.filename}\n")
                
                # Add EPUB metadata if available
                if metadata:
                    if metadata.get('title'):
                        f.write(f"Title: {metadata['title']}\n")
                    if metadata.get('author'):
                        f.write(f"Author: {metadata['author']}\n")
                    if metadata.get('language'):
                        f.write(f"Language: {metadata['language']}\n")
                
                f.write(f"Provider: {result.method}\n")
                f.write(f"Words: {result.metadata.wordCount}\n")
                f.write(f"Processing time: {result.metadata.processingTime:.2f}s\n\n")
                f.write(f"Word Timings:\n")
                f.write(f"-------------\n\n")
                
                for word in result.words:
                    duration = word.baseDelay * word.prosody.pause
                    f.write(f"{word.index:5d}. {word.text:20s} {duration:6.0f}ms")
                    if word.prosody.pauseAfter > 0:
                        f.write(f" +{word.prosody.pauseAfter}ms")
                    if word.prosody.emphasis.value != "none":
                        f.write(f" [{word.prosody.emphasis.value}]")
                    f.write(f"\n")
            
            media_type = "text/plain"
        
        logger.info(f"Generated output file: {output_path}")
        
        # Return file download with metadata in headers
        headers = {
            "Content-Disposition": f"attachment; filename={output_filename}",
            "X-Word-Count": str(result.metadata.wordCount),
            "X-Processing-Time": str(result.metadata.processingTime)
        }
        
        if metadata.get('title'):
            headers["X-Book-Title"] = metadata['title']
        if metadata.get('author'):
            headers["X-Book-Author"] = metadata['author']
        
        return FileResponse(
            path=str(output_path),
            filename=output_filename,
            media_type=media_type,
            headers=headers
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"File analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

