# Services

Business logic layer encapsulating application workflows.

## Services

- **PipelineService** - Coordinates the full analysis pipeline
  - Accepts raw text
  - Calls orchestrator
  - Enriches results with metadata
  - Returns final AnalysisResult

- **SessionService** - Manages user sessions (future)

- **LLMService** - Wraps LLM API calls (future)

## Usage

```python
from app.services.pipeline_service import pipeline_service

result = await pipeline_service.analyze(raw_text)
```

Services are injected via dependency injection in FastAPI endpoints.
