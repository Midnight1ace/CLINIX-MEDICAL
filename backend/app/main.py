from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .api.health import router as health_router
from .api.routes import router as api_router
from .api.auth_routes import router as auth_router
from .api.logger_routes import router as logger_router
from .config import settings
from .middleware.security import SecurityHeadersMiddleware
from .middleware.ratelimit import RateLimitMiddleware, AnalyzeRateLimitMiddleware
from .middleware.request_size import LimitRequestSizeMiddleware
from .middleware.csrf import CSRFMiddleware
from .middleware.logging import AuditLoggingMiddleware
from .middleware.auth import JWTBearer


def create_app() -> FastAPI:
    # Disable docs in production for security
    docs_url = None if settings.environment == "production" else "/docs"
    redoc_url = None if settings.environment == "production" else "/redoc"
    app = FastAPI(title=settings.app_name, docs_url=docs_url, redoc_url=redoc_url)
    # Request size limit (5MB)
    app.add_middleware(
        LimitRequestSizeMiddleware,
        max_size=5 * 1024 * 1024
    )

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    
    # For development, allow common localhost origins if none configured
    if not origins and settings.environment == "dev":
        origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=settings.environment != "production",
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["Vary"],
        )

    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(CSRFMiddleware)
    app.add_middleware(AuditLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_requests_per_minute)
    app.add_middleware(AnalyzeRateLimitMiddleware, requests_per_minute=settings.rate_limit_analyze_per_minute)

    app.include_router(health_router)
    app.include_router(api_router, prefix="/api")
    app.include_router(auth_router)
    app.include_router(logger_router)

    return app


app = create_app()
