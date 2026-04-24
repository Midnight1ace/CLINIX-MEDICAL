from typing import List, Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, model_validator

from ..utils.logger import log_frontend, session_logger

router = APIRouter(prefix="/api/logger", tags=["logger"])


class FrontendLogEntry(BaseModel):
    level: str
    message: str
    timestamp: str
    sessionId: str
    url: str = None
    
    @model_validator(mode='before')
    @classmethod
    def capture_extra_fields(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        # Extract known fields
        known_fields = {'level', 'message', 'timestamp', 'sessionId', 'url'}
        extra = {k: v for k, v in data.items() if k not in known_fields}
        data['extra_fields'] = extra
        return data
    
    extra_fields: Dict[str, Any] = {}


class FrontendLogBatch(BaseModel):
    logs: List[FrontendLogEntry]


@router.post("/frontend-logs")
async def receive_frontend_logs(log_batch: FrontendLogBatch, request: Request):
    """Receive and store frontend logs."""
    try:
        client_host = request.client.host if request.client else "unknown"
        
        for log_entry in log_batch.logs:
            # Log to session logger with all extra fields
            log_frontend(
                level=log_entry.level,
                message=f"[{client_host}] {log_entry.message}",
                frontend_session_id=log_entry.sessionId,
                frontend_url=log_entry.url,
                **log_entry.extra_fields
            )
        
        return {"status": "success", "received": len(log_batch.logs)}
    
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to process logs: {str(exc)}")


@router.get("/session-info")
async def get_session_info():
    """Get current logging session information."""
    return {
        "session_id": session_logger.get_session_id(),
        "log_directory": str(session_logger.get_log_dir()),
        "active_loggers": list(session_logger._loggers.keys())
    }


@router.get("/logs/{log_type}")
async def get_logs(log_type: str, lines: int = 100):
    """Retrieve recent logs by type (backend, frontend, errors, activity)."""
    valid_types = ['backend', 'frontend', 'errors', 'activity']
    
    if log_type not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid log type. Must be one of: {', '.join(valid_types)}"
        )
    
    log_file = session_logger.get_log_dir() / f"{log_type}.log"
    
    if not log_file.exists():
        return {"logs": [], "message": "Log file not found"}
    
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            all_lines = f.readlines()
            recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
            
        return {
            "log_type": log_type,
            "session_id": session_logger.get_session_id(),
            "total_lines": len(all_lines),
            "returned_lines": len(recent_lines),
            "logs": [line.strip() for line in recent_lines]
        }
    
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to read logs: {str(exc)}")
