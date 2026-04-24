from datetime import datetime, timedelta
from typing import Dict, Optional, List
from uuid import uuid4

from ..models.session import UserSession, SessionStatus
from ..config import settings


class SessionService:
    def __init__(self):
        # In production, use Redis or database
        self.sessions: Dict[str, UserSession] = {}
    
    def create_session(self, user_id: str, role: str, ip_address: str = None, 
                      user_agent: str = None) -> UserSession:
        """Create a new user session"""
        expires_at = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
        
        session = UserSession(
            user_id=user_id,
            role=role,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.sessions[session.session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[UserSession]:
        """Get a session by ID"""
        session = self.sessions.get(session_id)
        if session and session.is_active():
            return session
        elif session and not session.is_active():
            # Clean up expired session
            self.delete_session(session_id)
        return None
    
    def validate_session(self, session_id: str) -> bool:
        """Validate if a session is active and not expired"""
        session = self.get_session(session_id)
        return session is not None
    
    def extend_session(self, session_id: str, extension_minutes: int = 30) -> bool:
        """Extend session expiration"""
        session = self.get_session(session_id)
        if session:
            session.extend_session(extension_minutes)
            return True
        return False
    
    def delete_session(self, session_id: str) -> bool:
        """Delete/revoke a session"""
        if session_id in self.sessions:
            self.sessions[session_id].revoke()
            del self.sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Remove all expired sessions"""
        expired_sessions = [
            session_id for session_id, session in self.sessions.items()
            if not session.is_active()
        ]
        for session_id in expired_sessions:
            del self.sessions[session_id]
    
    def get_user_sessions(self, user_id: str) -> List[UserSession]:
        """Get all active sessions for a user"""
        return [
            session for session in self.sessions.values()
            if session.user_id == user_id and session.is_active()
        ]


# Global session service instance
session_service = SessionService()