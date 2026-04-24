# Models

Pydantic data models for request/response validation and serialization.

## Models

- **Patient** - Patient demographic data
- **ClinicalData** - Structured clinical data (symptoms, vitals, medications)
- **AnalysisRequest** - Request to /api/analyze
- **AnalysisResult** - Full pipeline output
- **RiskItem** - Individual risk finding
- **RecommendationItem** - Clinical recommendation
- **ExplainabilityItem** - Reasoning trace

## Usage

Models enforce type safety:
```python
from app.models.patient import Patient
from app.models.analysis import AnalysisRequest, AnalysisResult

# Validation happens automatically in FastAPI
request: AnalysisRequest = await request.json()
```

## Serialization

All models use Pydantic `model_config` with:
- `populate_by_name=True` - Accept field aliases
- `from_attributes=True` - ORM mode for database models (future)
