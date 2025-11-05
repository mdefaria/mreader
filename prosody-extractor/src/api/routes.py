"""FastAPI routes for prosody extraction API."""

import logging
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import AnalysisRequest, ProsodyResult, HealthResponse
from ..core.processor import ProsodyProcessor

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
        wpm = options.get('wpm', 300)
        sensitivity = options.get('sensitivity', 0.7)
        
        # Initialize processor with requested provider
        processor = ProsodyProcessor(
            provider=request.provider,
            **options
        )
        
        # Analyze text
        result = processor.analyze(
            text=request.text,
            wpm=wpm,
            sensitivity=sensitivity,
            **options
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
