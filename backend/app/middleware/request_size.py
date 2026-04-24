from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class LimitRequestSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size: int = 5 * 1024 * 1024):
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request, call_next):
        # Check content-length header
        if "content-length" in request.headers:
            content_length = int(request.headers["content-length"])
            if content_length > self.max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request entity too large. Maximum size allowed is {self.max_size} bytes"
                )
        
        response = await call_next(request)
        return response
