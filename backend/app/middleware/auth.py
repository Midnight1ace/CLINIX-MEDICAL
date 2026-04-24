from typing import Callable, Optional

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..utils.jwt import verify_token, TokenData
from ..utils.cookies import get_token_from_request


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request):
        # First try to get token from cookie
        token = get_token_from_request(request)
        if not token:
            # Fallback to Authorization header for backward compatibility
            credentials: HTTPAuthorizationCredentials = await super().__call__(request)
            if credentials:
                if not credentials.scheme == "Bearer":
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication scheme"
                    )
                token = credentials.credentials

        if token:
            token_data = verify_token(token)
            if not token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
            request.state.user = token_data
            return token_data
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )


def authenticated() -> Callable:
    return JWTBearer()
