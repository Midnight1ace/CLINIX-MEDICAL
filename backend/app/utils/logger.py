import logging
import sys
import os
from typing import Any, Dict, Optional
from datetime import datetime
import json
import uuid
from pathlib import Path

from ..config import settings


class SessionLogger:
    """Session-based logger that creates a new folder for each session."""
    
    _instance = None
    _session_id = None
    _log_dir = None
    _loggers = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionLogger, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, base_log_dir: str = "logs"):
        if hasattr(self, '_initialized') and self._initialized:
            return
        
        self._initialized = True
        self._session_id = datetime.now().strftime("%Y%m%d_%H%M%S") + "_" + str(uuid.uuid4())[:8]
        self._base_log_dir = Path(base_log_dir)
        
        # Create session directory
        self._log_dir = self._base_log_dir / self._session_id
        self._log_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize loggers for different components
        self._setup_loggers()
        
        # Log session start
        self.backend_info(f"Logging session started: {self._session_id}")
    
    def _setup_loggers(self):
        """Setup different loggers for backend and frontend."""
        
        # Backend logger
        backend_logger = logging.getLogger(f"clinix.backend.{self._session_id}")
        backend_logger.setLevel(logging.DEBUG)
        backend_logger.handlers.clear()
        
        backend_handler = logging.FileHandler(self._log_dir / "backend.log")
        backend_handler.setLevel(logging.DEBUG)
        backend_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        backend_handler.setFormatter(backend_formatter)
        backend_logger.addHandler(backend_handler)
        
        # Console handler for real-time monitoring
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter('%(asctime)s - BACKEND - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_formatter)
        backend_logger.addHandler(console_handler)
        
        self._loggers['backend'] = backend_logger
        
        # Frontend logger (for receiving frontend logs)
        frontend_logger = logging.getLogger(f"clinix.frontend.{self._session_id}")
        frontend_logger.setLevel(logging.DEBUG)
        frontend_logger.handlers.clear()
        
        frontend_handler = logging.FileHandler(self._log_dir / "frontend.log")
        frontend_handler.setLevel(logging.DEBUG)
        frontend_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        frontend_handler.setFormatter(frontend_formatter)
        frontend_logger.addHandler(frontend_handler)
        
        self._loggers['frontend'] = frontend_logger
        
        # Errors logger (consolidated errors from both)
        error_logger = logging.getLogger(f"clinix.errors.{self._session_id}")
        error_logger.setLevel(logging.ERROR)
        error_logger.handlers.clear()
        
        error_handler = logging.FileHandler(self._log_dir / "errors.log")
        error_formatter = logging.Formatter('%(asctime)s - %(levelname)s - [%(name)s] - %(message)s')
        error_handler.setFormatter(error_formatter)
        error_logger.addHandler(error_handler)
        
        self._loggers['errors'] = error_logger
        
        # Activity logger (all activities)
        activity_logger = logging.getLogger(f"clinix.activity.{self._session_id}")
        activity_logger.setLevel(logging.INFO)
        activity_logger.handlers.clear()
        
        activity_handler = logging.FileHandler(self._log_dir / "activity.log")
        activity_formatter = logging.Formatter('%(asctime)s - %(message)s')
        activity_handler.setFormatter(activity_formatter)
        activity_logger.addHandler(activity_handler)
        
        self._loggers['activity'] = activity_logger
    
    def _log(self, component: str, level: str, message: str, **kwargs):
        """Internal log method."""
        logger = self._loggers.get(component)
        if not logger:
            return
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "message": message,
            "session_id": self._session_id,
            "component": component,
            **kwargs
        }
        
        log_message = json.dumps(log_entry)
        
        if level == "DEBUG":
            logger.debug(log_message)
        elif level == "INFO":
            logger.info(log_message)
        elif level == "WARNING":
            logger.warning(log_message)
        elif level == "ERROR":
            logger.error(log_message)
            # Also log to errors logger
            self._loggers['errors'].error(log_message)
        elif level == "CRITICAL":
            logger.critical(log_message)
            self._loggers['errors'].critical(log_message)
        
        # Log to activity
        self._loggers['activity'].info(f"[{component.upper()}] {message}")
    
    def backend_debug(self, message: str, **kwargs):
        self._log('backend', 'DEBUG', message, **kwargs)
    
    def backend_info(self, message: str, **kwargs):
        self._log('backend', 'INFO', message, **kwargs)
    
    def backend_warning(self, message: str, **kwargs):
        self._log('backend', 'WARNING', message, **kwargs)
    
    def backend_error(self, message: str, **kwargs):
        self._log('backend', 'ERROR', message, **kwargs)
    
    def backend_critical(self, message: str, **kwargs):
        self._log('backend', 'CRITICAL', message, **kwargs)
    
    def frontend_log(self, level: str, message: str, **kwargs):
        """Log frontend activity."""
        self._log('frontend', level, message, **kwargs)
    
    def log_activity(self, activity: str, **kwargs):
        """Log general activity."""
        self._loggers['activity'].info(f"{activity} - {json.dumps(kwargs) if kwargs else ''}")
    
    def get_session_id(self) -> str:
        return self._session_id
    
    def get_log_dir(self) -> Path:
        return self._log_dir


# Global session logger instance
session_logger = SessionLogger()


# Convenience functions for backend logging
def log_backend_debug(message: str, **kwargs):
    session_logger.backend_debug(message, **kwargs)

def log_backend_info(message: str, **kwargs):
    session_logger.backend_info(message, **kwargs)

def log_backend_warning(message: str, **kwargs):
    session_logger.backend_warning(message, **kwargs)

def log_backend_error(message: str, **kwargs):
    session_logger.backend_error(message, **kwargs)

def log_backend_critical(message: str, **kwargs):
    session_logger.backend_critical(message, **kwargs)


# Convenience function for frontend logs (received via API)
def log_frontend(level: str, message: str, **kwargs):
    session_logger.frontend_log(level, message, **kwargs)


# Original audit logger functions (maintained for compatibility)
class SecurityAuditLogger:
    def __init__(self, name: str = "clinix.security"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def info(self, event: str, **kwargs):
        self._log("INFO", event, **kwargs)
    
    def warning(self, event: str, **kwargs):
        self._log("WARNING", event, **kwargs)
    
    def error(self, event: str, **kwargs):
        self._log("ERROR", event, **kwargs)
    
    def _log(self, level: str, event: str, **kwargs):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "event": event,
            "environment": settings.environment,
            **kwargs
        }
        self.logger.info(json.dumps(log_entry))
        # Also log to session logger
        session_logger.backend_info(event, **kwargs)


# Global audit logger instance
audit_logger = SecurityAuditLogger()


def log_auth_event(event: str, user_id: str = None, success: bool = True, **kwargs):
    """Log authentication-related events"""
    audit_logger.info(
        event=event,
        category="authentication",
        user_id=user_id,
        success=success,
        **kwargs
    )
    session_logger.backend_info(f"Auth: {event}", user_id=user_id, success=success, **kwargs)


def log_access_event(event: str, user_id: str = None, resource: str = None, 
                    permission: str = None, success: bool = True, **kwargs):
    """Log access control events"""
    audit_logger.info(
        event=event,
        category="access_control",
        user_id=user_id,
        resource=resource,
        permission=permission,
        success=success,
        **kwargs
    )
    session_logger.backend_info(f"Access: {event}", user_id=user_id, resource=resource, **kwargs)


def log_security_event(event: str, severity: str = "medium", **kwargs):
    """Log security-related events"""
    level_map = {
        "low": logging.INFO,
        "medium": logging.WARNING,
        "high": logging.ERROR,
        "critical": logging.CRITICAL
    }
    level = level_map.get(severity.lower(), logging.WARNING)
    
    audit_logger.logger.log(
        level,
        json.dumps({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": severity.upper(),
            "event": event,
            "category": "security",
            "environment": settings.environment,
            **kwargs
        })
    )
    
    # Log to session logger
    session_logger.backend_warning(f"Security: {event}", severity=severity, **kwargs) if severity in ["low", "medium"] else session_logger.backend_error(f"Security: {event}", severity=severity, **kwargs)


def log_data_access(event: str, user_id: str = None, patient_id: str = None, 
                   action: str = None, **kwargs):
    """Log patient data access events"""
    audit_logger.info(
        event=event,
        category="data_access",
        user_id=user_id,
        patient_id=patient_id,
        action=action,
        **kwargs
    )
    session_logger.backend_info(f"Data Access: {event}", user_id=user_id, patient_id=patient_id, **kwargs)
