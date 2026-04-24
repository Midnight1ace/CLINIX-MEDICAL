from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from uuid import uuid4


class SessionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"


class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    role: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    status: SessionStatus = SessionStatus.ACTIVE
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at
    
    def is_active(self) -> bool:
        return self.status == SessionStatus.ACTIVE and not self.is_expired()
    
    def extend_session(self, extension_minutes: int = 30):
        """Extend session expiration time"""
        if self.is_active():
            self.expires_at = datetime.utcnow() + timedelta(minutes=extension_minutes)
            self.last_accessed = datetime.utcnow()
    
    def revoke(self):
        """Revoke the session"""
        self.status = SessionStatus.REVOKED