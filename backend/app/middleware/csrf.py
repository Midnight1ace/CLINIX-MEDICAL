import secrets
import hashlib
from typing import Dict

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

from ..config import settings


class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # In production, use Redis or database for storage
        self.tokens: Dict[str, str] = {}

    def generate_csrf_token(self) -> str:
        """Generate a cryptographically secure CSRF token"""
        return secrets.token_urlsafe(32)

    def get_token_hash(self, token: str) -> str:
        """Hash token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()

    async def dispatch(self, request, call_next):
        # Skip CSRF check for safe methods
        if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
            return await call_next(request)
        
        # Skip CSRF check for exempt paths
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # For development, be more lenient
        if settings.environment == "dev":
            return await call_next(request)
        
        # Get CSRF token from header
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            # Also check form data for backward compatibility
            # This would require parsing the body, so we'll rely on header
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing"
            )
        
        # In a real implementation, validate against stored token
        # For now, we'll accept any token in dev, require proper validation in prod
        if settings.environment == "production":
            # TODO: Implement proper token validation against user session
            pass
        
        response = await call_next(request)
        return response