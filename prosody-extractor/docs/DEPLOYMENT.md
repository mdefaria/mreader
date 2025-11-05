# Deployment Guide

This guide covers deploying the Prosody Extractor as a cloud function or containerized service.

## Prerequisites

- Python 3.11+
- Cloud provider account (AWS, GCP, or Azure)
- Docker (for containerized deployment)

## Local Testing

Before deploying to the cloud, test locally:

```bash
cd prosody-extractor

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env and add API keys if using LLM providers
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Run the server
python src/main.py

# Test in another terminal
curl http://localhost:8000/api/v1/health
```

## Docker Deployment

### Build Docker Image

Create a `Dockerfile` in the `prosody-extractor` directory:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "src/main.py"]
```

Build and run:

```bash
# Build image
docker build -t prosody-extractor:latest .

# Run container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=your_key \
  -e ANTHROPIC_API_KEY=your_key \
  prosody-extractor:latest

# Test
curl http://localhost:8000/api/v1/health
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  prosody-extractor:
    build: .
    ports:
      - "8000:8000"
    environment:
      - LOG_LEVEL=INFO
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## AWS Lambda Deployment

### Serverless Framework

Install Serverless:

```bash
npm install -g serverless
```

Create `serverless.yml`:

```yaml
service: prosody-extractor

provider:
  name: aws
  runtime: python3.11
  stage: ${opt:stage, 'dev'}
  region: us-east-1
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    ANTHROPIC_API_KEY: ${env:ANTHROPIC_API_KEY}
  timeout: 30
  memorySize: 1024

functions:
  api:
    handler: lambda_handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true
    layer: true
```

Create `lambda_handler.py`:

```python
"""AWS Lambda handler for Prosody Extractor."""

from mangum import Mangum
from src.main import app

handler = Mangum(app)
```

Add to `requirements.txt`:

```
mangum==0.17.0
```

Deploy:

```bash
serverless deploy
```

### AWS SAM

Create `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 1024
    Environment:
      Variables:
        LOG_LEVEL: INFO

Resources:
  ProsodyExtractorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: .
      Handler: lambda_handler.handler
      Runtime: python3.11
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY

Outputs:
  ProsodyExtractorApi:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
```

Deploy:

```bash
sam build
sam deploy --guided
```

## Google Cloud Functions

### Create function

Create `main.py` for Cloud Functions:

```python
"""Google Cloud Function entry point."""

from src.main import app

def prosody_extractor(request):
    """Cloud Function entry point."""
    from werkzeug.wrappers import Request, Response
    
    with app.request_context(Request(request.environ)):
        response = app.full_dispatch_request()
    
    return Response.from_app(response, request.environ)
```

Deploy:

```bash
gcloud functions deploy prosody-extractor \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point prosody_extractor \
  --set-env-vars OPENAI_API_KEY=your_key,ANTHROPIC_API_KEY=your_key
```

### Cloud Run

Build and deploy to Cloud Run:

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/prosody-extractor

# Deploy to Cloud Run
gcloud run deploy prosody-extractor \
  --image gcr.io/PROJECT_ID/prosody-extractor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_key,ANTHROPIC_API_KEY=your_key
```

## Azure Functions

Create `function.json`:

```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post"],
      "route": "{*route}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

Create `__init__.py`:

```python
"""Azure Function entry point."""

import azure.functions as func
from src.main import app

async def main(req: func.HttpRequest) -> func.HttpResponse:
    """Azure Function entry point."""
    return func.AsgiMiddleware(app).handle(req)
```

Deploy:

```bash
func azure functionapp publish YOUR_FUNCTION_APP_NAME
```

## Environment Variables

Ensure these environment variables are set in your deployment:

### Required for LLM Providers

- `OPENAI_API_KEY`: OpenAI API key (if using openai provider)
- `ANTHROPIC_API_KEY`: Anthropic API key (if using anthropic provider)

### Optional

- `LOG_LEVEL`: Logging level (default: INFO)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `DEFAULT_PROVIDER`: Default provider (default: rule-based)

## Monitoring and Logging

### CloudWatch (AWS)

Lambda functions automatically log to CloudWatch. View logs:

```bash
serverless logs -f api -t
```

### Cloud Logging (GCP)

View logs in Cloud Console or CLI:

```bash
gcloud functions logs read prosody-extractor
```

### Application Insights (Azure)

Configure Application Insights in Azure Portal for monitoring.

## Scaling Considerations

### AWS Lambda

- Default concurrent executions: 1000
- Can request increase via AWS Support
- Consider provisioned concurrency for consistent performance

### Google Cloud Run

- Auto-scales from 0 to configured max instances
- Set max instances to control costs:
  ```bash
  gcloud run services update prosody-extractor --max-instances 10
  ```

### Container Orchestration

For high-volume production use, consider:

- **Kubernetes**: Deploy with HPA (Horizontal Pod Autoscaler)
- **ECS/Fargate**: AWS container orchestration
- **Cloud Run**: Google's managed container platform

## Cost Optimization

### Rule-based Provider

- Near-zero compute cost
- Very fast processing (~5 seconds per 100K words)
- Recommended for high-volume scenarios

### LLM Providers

- OpenAI: ~$0.10 per 100K words
- Anthropic: ~$0.15 per 100K words
- Consider caching results for frequently analyzed texts
- Use tiered processing (rule-based for simple, LLM for complex)

### Caching Strategy

Implement Redis or DynamoDB for caching:

```python
# Example caching with Redis
import redis
import hashlib

redis_client = redis.Redis(host='localhost', port=6379)

def get_cached_result(text: str, provider: str) -> Optional[dict]:
    key = f"{provider}:{hashlib.sha256(text.encode()).hexdigest()}"
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None

def cache_result(text: str, provider: str, result: dict):
    key = f"{provider}:{hashlib.sha256(text.encode()).hexdigest()}"
    redis_client.setex(key, 86400, json.dumps(result))  # 24 hour TTL
```

## Security Best Practices

1. **API Keys**: Store in secrets manager (AWS Secrets Manager, GCP Secret Manager)
2. **Authentication**: Implement API key or OAuth for production
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Already implemented in Pydantic models
5. **CORS**: Configure appropriately for your use case
6. **HTTPS**: Always use HTTPS in production

## Health Checks

Configure health check endpoint for load balancers:

```
GET /api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "providers": ["rule-based", "openai", "anthropic"]
}
```

## Troubleshooting

### High cold start times

- Use provisioned concurrency (AWS Lambda)
- Increase memory allocation
- Consider keeping containers warm

### API timeouts

- Increase function timeout settings
- Use async processing for large texts
- Implement request queuing

### High costs

- Use rule-based provider where possible
- Implement aggressive caching
- Set up cost alerts
- Monitor usage patterns

## Next Steps

After deployment:

1. Set up monitoring and alerting
2. Implement rate limiting
3. Add authentication
4. Configure CDN for static assets
5. Set up CI/CD pipeline
6. Implement caching layer
7. Load test to determine scaling needs
