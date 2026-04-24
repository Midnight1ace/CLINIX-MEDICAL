# CLINIX Backend

FastAPI-based backend serving the multi-agent clinical workflow engine.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Settings from environment
│   │
│   ├── api/                 # API routes
│   │   ├── routes.py        # Main /api/analyze endpoint
│   │   └── health.py        # /health endpoint
│   │
│   ├── agents/              # Multi-agent system
│   │   ├── ingestion_agent.py
│   │   ├── summary_agent.py
│   │   ├── risk_agent.py
│   │   ├── recommendation_agent.py
│   │   ├── explainability_agent.py
│   │   └── orchestrator.py  # Coordinates agent pipeline
│   │
│   ├── core/               # Core configuration and constants
│   │   ├── constants.py    # App constants
│   │   └── prompts.py      # LLM prompts (future)
│   │
│   ├── middleware/         # HTTP middleware
│   │   ├── auth.py         # JWT authentication
│   │   ├── authorization.py # Role-based access control
│   │   ├── security.py     # Security headers
│   │   ├── ratelimit.py    # Rate limiting
│   │   ├── csrf.py         # CSRF protection
│   │   ├── logging.py      # Audit logging
│   │   └── request_size.py # Request size limits
│   │
│   ├── models/             # Pydantic data models
│   │   ├── patient.py      # Patient schemas
│   │   ├── analysis.py     # Analysis result schemas
│   │   ├── risk.py         # Risk models
│   │   ├── response.py     # API response models
│   │   ├── auth.py         # Auth schemas
│   │   └── session.py      # Session models
│   │
│   ├── services/           # Business logic
│   │   ├── pipeline_service.py  # Orchestrates analysis pipeline
│   │   ├── llm_service.py       # LLM integration (future)
│   │   └── session.py           # Session management
│   │
│   └── utils/              # Utility functions
│       ├── jwt.py          # JWT token handling
│       ├── cookies.py      # Cookie management
│       ├── sanitize.py     # Input sanitization
│       ├── security.py     # Password hashing
│       ├── parser.py       # Text parsing
│       ├── rules_engine.py # Rule-based reasoning
│       └── logger.py       # Logging utilities
```

## Quick Start

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate   # Unix/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API available at http://localhost:8000

## API Endpoints

### POST `/api/analyze`
Analyzes raw patient notes and returns structured clinical insights.

**Request:**
```json
{
  "raw_text": "45-year-old male with chest pain..."
}
```

**Response:** AnalysisResult with summary, risks, recommendations, etc.

### GET `/health`
Health check endpoint.

## Agent Pipeline

1. **Ingestion Agent** - Parses raw text into structured PatientData
2. **Summary Agent** - Generates clinical summary
3. **Risk Agent** - Detects risks using rules engine
4. **Recommendation Agent** - Suggests next steps
5. **Explainability Agent** - Provides reasoning trace

All agents are coordinated by the `Orchestrator` class.

## Security

- JWT-based authentication
- Role-based access control (Doctor, Patient, Admin)
- Password bcrypt hashing
- CSRF protection
- Rate limiting
- Security headers (CORS, HSTS)
- Input sanitization

## Configuration

Environment variables in `.env`:
- `SECRET_KEY` - JWT signing secret
- `DATABASE_URL` - Database connection (future)
- `OPENAI_API_KEY` - For LLM features (future)

## Testing

```bash
python test_security.py  # Verify security implementation
```

## Dependencies

See `requirements.txt` for full list. Key packages:
- FastAPI - Web framework
- Pydantic - Data validation
- Uvicorn - ASGI server
- Python-Jose - JWT handling
- Passlib/Bcrypt - Password hashing
- SlowAPI - Rate limiting
- LangChain - LLM orchestration (optional)
