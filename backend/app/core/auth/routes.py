from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_supabase_client, get_supabase_admin_client
from app.core.auth.models import (
    UserCreate, UserLogin, UserProfile, TokenResponse, TokenRefresh,
    DomainType, RoleType
)
from app.core.auth.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user account."""
    try:
        supabase = get_supabase_client()
        admin_client = get_supabase_admin_client()
        
        # Create auth user with Supabase
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "domain": user_data.domain.value,
                    "role": user_data.role.value
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        user_id = auth_response.user.id
        
        # Create profile in profiles table
        profile_data = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "domain": user_data.domain.value,
            "role": user_data.role.value,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        admin_client.table("profiles").insert(profile_data).execute()
        
        # Return tokens
        session = auth_response.session
        
        return TokenResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=UserProfile(
                id=user_id,
                email=user_data.email,
                full_name=user_data.full_name,
                phone=user_data.phone,
                domain=user_data.domain,
                role=user_data.role,
                is_active=True,
                created_at=datetime.utcnow()
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return tokens."""
    try:
        supabase = get_supabase_client()
        admin_client = get_supabase_admin_client()
        
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user_id = auth_response.user.id
        
        # Get user profile
        profile_response = admin_client.table("profiles").select("*").eq("id", user_id).single().execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        profile = profile_response.data
        
        # Validate domain access
        user_role = RoleType(profile["role"])
        user_domain = DomainType(profile["domain"])
        requested_domain = credentials.domain
        
        # Citizens can access any domain
        if user_role != RoleType.CITIZEN:
            if user_domain != requested_domain:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You don't have access to {requested_domain.value} domain"
                )
        
        # Update profile with selected domain for session
        admin_client.table("profiles").update({
            "current_domain": requested_domain.value
        }).eq("id", user_id).execute()
        
        session = auth_response.session
        
        return TokenResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=UserProfile(
                id=profile["id"],
                email=profile["email"],
                full_name=profile["full_name"],
                phone=profile.get("phone"),
                domain=requested_domain,  # Use requested domain for session
                role=user_role,
                is_active=profile.get("is_active", True),
                created_at=profile["created_at"],
                locality=profile.get("locality"),
                zone=profile.get("zone"),
                institution_id=profile.get("institution_id")
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_data: TokenRefresh):
    """Refresh access token."""
    try:
        supabase = get_supabase_client()
        admin_client = get_supabase_admin_client()
        
        auth_response = supabase.auth.refresh_session(token_data.refresh_token)
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = auth_response.user.id
        
        # Get user profile
        profile_response = admin_client.table("profiles").select("*").eq("id", user_id).single().execute()
        profile = profile_response.data
        
        session = auth_response.session
        
        return TokenResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=UserProfile(
                id=profile["id"],
                email=profile["email"],
                full_name=profile["full_name"],
                phone=profile.get("phone"),
                domain=DomainType(profile.get("current_domain", profile["domain"])),
                role=RoleType(profile["role"]),
                is_active=profile.get("is_active", True),
                created_at=profile["created_at"],
                locality=profile.get("locality"),
                zone=profile.get("zone"),
                institution_id=profile.get("institution_id")
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/logout")
async def logout(user: UserProfile = Depends(get_current_user)):
    """Logout current user."""
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: UserProfile = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return user
