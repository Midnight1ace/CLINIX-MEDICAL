# Middleware

HTTP middleware components for security, logging, and request processing.

## Middleware Stack

Order matters (top to bottom):

1. **SecurityHeadersMiddleware** - Adds security headers (CSP, HSTS, etc.)
2. **RateLimitMiddleware** - Global rate limiting
3. **AnalyzeRateLimitMiddleware** - Specific limit for /api/analyze
4. **LimitRequestSizeMiddleware** - Request body size limits
5. **AuditLoggingMiddleware** - Logs all requests
6. **CSRFMiddleware** - CSRF token validation (forms)
7. **JWTAuthMiddleware** - JWT token extraction & validation
8. **AuthorizationMiddleware** - Role-based access control

## Usage

Middleware is registered in `main.py`:
```python
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, ...)
```

## Developing

Create new middleware as a class with `__init__` and `dispatch`:
```python
class CustomMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        # Pre-processing
        await self.app(scope, receive, send)
        # Post-processing
```
