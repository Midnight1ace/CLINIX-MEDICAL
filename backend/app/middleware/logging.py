import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from ..utils.logger import (
    log_auth_event,
    log_access_event,
    log_security_event,
    log_data_access,
    session_logger,
    log_backend_info,
    log_backend_error
)


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        
        # Extract user info if available
        user_id = getattr(request.state, 'user', None)
        if user_id and hasattr(user_id, 'user_id'):
            user_id = user_id.user_id
        elif user_id:
            user_id = str(user_id)
        else:
            user_id = None
        
        # Log request start to session logger
        log_backend_info(
            f"Request started: {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            user_id=user_id,
            client_host=request.client.host if request.client else None
        )
        
        # Also log to security events (for compatibility)
        log_security_event(
            event="request_started",
            severity="low",
            method=request.method,
            path=request.url.path,
            user_id=user_id,
            client_host=request.client.host if request.client else None
        )
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful request
            log_backend_info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                process_time=round(process_time, 3),
                user_id=user_id
            )
            
            log_security_event(
                event="request_completed",
                severity="low",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                process_time=round(process_time, 3),
                user_id=user_id
            )
            
            # Add process time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as exc:
            process_time = time.time() - start_time
            
            # Log failed request
            log_backend_error(
                f"Request failed: {request.method} {request.url.path} - {type(exc).__name__}: {str(exc)}",
                method=request.method,
                path=request.url.path,
                process_time=round(process_time, 3),
                user_id=user_id,
                error_type=type(exc).__name__,
                error_message=str(exc)
            )
            
            log_security_event(
                event="request_failed",
                severity="high",
                method=request.method,
                path=request.url.path,
                process_time=round(process_time, 3),
                user_id=user_id,
                error_type=type(exc).__name__,
                error_message=str(exc)
            )
            
            # Re-raise the exception
            raise