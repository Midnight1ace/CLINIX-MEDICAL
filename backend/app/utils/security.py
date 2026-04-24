import hashlib
import hmac
import secrets
from typing import Optional

import bcrypt
from passlib.context import CryptContext

from ..config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_secret_key(length: int = 32) -> str:
    """
    Generate a cryptographically secure secret key
    """
    return secrets.token_urlsafe(length)


def verify_api_key(client_key: str, server_key: str) -> bool:
    """
    Verify an API key using HMAC to prevent timing attacks
    """
    if not client_key or not server_key:
        return False
    return hmac.compare_digest(
        hashlib.sha256(client_key.encode()).hexdigest(),
        hashlib.sha256(server_key.encode()).hexdigest()
    )


def generate_password_reset_token() -> str:
    """
    Generate a secure password reset token
    """
    return secrets.token_urlsafe(32)


def generate_email_verification_token() -> str:
    """
    Generate a secure email verification token
    """
    return secrets.token_urlsafe(32)