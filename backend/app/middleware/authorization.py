from typing import Callable, TypeVar, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..models.auth import User, UserRole
from ..middleware.auth import JWTBearer, TokenData


F = TypeVar('F', bound=Callable)


def requires_role(required_role: UserRole) -> Callable[[F], F]:
    """
    Decorator to require a specific role for endpoint access.
    Usage: @requires_role(UserRole.DOCTOR)
    """
    def decorator(func: F) -> F:
        # This is a marker decorator - actual checking happens in dependency
        func._required_role = required_role  # type: ignore
        return func
    return decorator


def requires_any_role(*required_roles: UserRole) -> Callable[[F], F]:
    """
    Decorator to require any of the specified roles for endpoint access.
    Usage: @requires_any_role(UserRole.DOCTOR, UserRole.ADMIN)
    """
    def decorator(func: F) -> F:
        func._required_roles = required_roles  # type: ignore
        return func
    return decorator


class RoleChecker:
    def __init__(self, required_role: Union[UserRole, tuple[UserRole, ...]]):
        if isinstance(required_role, UserRole):
            self.required_role = required_role
            self.require_any = False
        else:
            self.required_role = required_role
            self.require_any = True
    
    async def __call__(self, token_data: TokenData = Depends(JWTBearer())):
        # Verify token and get user data
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Convert token data to User model
        user = User(
            user_id=token_data.user_id,
            role=UserRole(token_data.role) if token_data.role else UserRole.PATIENT
        )
        
        # Check permissions
        if self.require_any:
            # Check if user has any of the required roles
            has_permission = any(user.has_role(role) for role in self.required_role)
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
        else:
            # Check if user has the specific required role
            if not user.has_role(self.required_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
        
        return user


def get_current_user() -> Callable:
    """Dependency to get current authenticated user"""
    return JWTBearer()


# Pre-built dependencies for common roles
def require_patient() -> RoleChecker:
    return RoleChecker(UserRole.PATIENT)


def require_doctor() -> RoleChecker:
    return RoleChecker(UserRole.DOCTOR)


def require_admin() -> RoleChecker:
    return RoleChecker(UserRole.ADMIN)


def require_doctor_or_admin() -> RoleChecker:
    return RoleChecker((UserRole.DOCTOR, UserRole.ADMIN))