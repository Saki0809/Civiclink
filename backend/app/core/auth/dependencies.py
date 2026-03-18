from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.database import get_supabase_client, get_supabase_admin_client
from app.core.auth.models import UserProfile, DomainType, RoleType
from typing import Optional
import json

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserProfile:
    """Validate JWT token and return current user profile."""
    token = credentials.credentials
    
    try:
        supabase = get_supabase_client()
        
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user = user_response.user
        
        # Get user profile from profiles table
        admin_client = get_supabase_admin_client()
        profile_response = admin_client.table("profiles").select("*").eq("id", user.id).single().execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile_data = profile_response.data
        
        return UserProfile(
            id=profile_data["id"],
            email=profile_data["email"],
            full_name=profile_data["full_name"],
            phone=profile_data.get("phone"),
            domain=DomainType(profile_data["domain"]),
            role=RoleType(profile_data["role"]),
            is_active=profile_data.get("is_active", True),
            created_at=profile_data["created_at"],
            locality=profile_data.get("locality"),
            zone=profile_data.get("zone"),
            institution_id=profile_data.get("institution_id")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


def require_domain(allowed_domains: list[DomainType]):
    """Dependency to require specific domain access."""
    async def domain_checker(user: UserProfile = Depends(get_current_user)) -> UserProfile:
        # Citizens can access all domains
        if user.role == RoleType.CITIZEN:
            return user
        
        if user.domain not in allowed_domains:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required domains: {[d.value for d in allowed_domains]}"
            )
        return user
    return domain_checker


def require_role(allowed_roles: list[RoleType]):
    """Dependency to require specific roles."""
    async def role_checker(user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
            )
        return user
    return role_checker


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[UserProfile]:
    """Get current user if authenticated, None otherwise."""
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
