from ..config import settings


def set_auth_cookies(response, access_token: str, refresh_token: str = None):
    """
    Set HTTP-only secure cookies for authentication
    """
    # Access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.access_token_expire_minutes * 60,  # Convert minutes to seconds
        httponly=True,
        secure=settings.environment == "production",  # Secure only in production
        samesite="strict",
        path="/"
    )
    
    # Refresh token cookie (if provided)
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=settings.refresh_token_expire_days * 24 * 60 * 60,  # Convert days to seconds
            httponly=True,
            secure=settings.environment == "production",  # Secure only in production
            samesite="strict",
            path="/auth/refresh"
        )


def clear_auth_cookies(response):
    """
    Clear authentication cookies
    """
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/auth/refresh")


def get_token_from_request(request) -> str:
    """
    Extract access token from request cookies
    """
    return request.cookies.get("access_token")


def get_refresh_token_from_request(request) -> str:
    """
    Extract refresh token from request cookies
    """
    return request.cookies.get("refresh_token")