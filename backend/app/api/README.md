# API Layer

HTTP endpoints and route definitions.

## Endpoints

### `routes.py`
Main application routes.
- `POST /api/analyze` - Analyze patient notes (protected)
- Organized with FastAPI APIRouter

### `health.py`
Health check endpoints.
- `GET /health` - Service health status

## Authentication

Most endpoints require JWT authentication via `JWTBearer` dependency.

## Rate Limiting

Analysis endpoint is rate-limited to prevent abuse.
