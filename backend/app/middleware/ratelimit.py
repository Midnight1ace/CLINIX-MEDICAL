import time
from typing import Dict, Tuple, List
from collections import defaultdict

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from ..config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        # In production, replace with Redis
        self.requests: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        now = time.time()

        # Clean old requests (older than 1 minute)
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if now - req_time < 60
            ]
        else:
            self.requests[client_ip] = []

        # Check rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )

        # Add current request
        self.requests[client_ip].append(now)

        response = await call_next(request)
        return response


class AnalyzeRateLimitMiddleware(BaseHTTPMiddleware):
    """Special rate limit for /api/analyze endpoint"""
    def __init__(self, app, requests_per_minute: int = 10):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        # Track per user/IP combination
        self.requests: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    async def dispatch(self, request, call_next):
        if request.url.path != "/api/analyze":
            return await call_next(request)

        # Get user ID from state if authenticated, otherwise use IP
        user_id = getattr(request.state, 'user', None)
        if user_id and hasattr(user_id, 'user_id'):
            identifier = user_id.user_id
        else:
            identifier = request.client.host if request.client else "unknown"

        path = request.url.path
        now = time.time()

        # Clean old requests (older than 1 minute)
        key = (identifier, path)
        if key in self.requests:
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if now - req_time < 60
            ]
        else:
            self.requests[key] = []

        # Check rate limit
        if len(self.requests[key]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Analyze endpoint rate limit exceeded"
            )

        # Add current request
        self.requests[key].append(now)

        response = await call_next(request)
        return response
