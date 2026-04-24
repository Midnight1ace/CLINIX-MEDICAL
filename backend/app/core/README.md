# Core

Core configuration, constants, and shared utilities.

## Modules

- **config.py** - Application settings loaded from environment
- **constants.py** - App-wide constants
- **prompts.py** - LLM prompt templates (future)

## Settings

Configuration uses Pydantic Settings:
```python
from app.config import settings
```

Available settings:
- `SECRET_KEY` - JWT signing secret
- `ALGORITHM` - JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL` (future)
- `OPENAI_API_KEY` (future)
