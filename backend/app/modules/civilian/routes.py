from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.auth.dependencies import get_current_user
from app.core.auth.models import UserProfile
from app.modules.civilian.models import (
    OpportunityList, OpportunityType, OpportunityDomain,
    ApplicationTrackerList, UserPreferences, UserPreferencesUpdate
)
from app.modules.civilian.service import civilian_service

router = APIRouter(prefix="/civilian", tags=["Civilian Dashboard"])


@router.get("/opportunities", response_model=OpportunityList)
async def get_opportunities(
    domain: Optional[OpportunityDomain] = Query(None, description="Filter by domain"),
    type: Optional[OpportunityType] = Query(None, description="Filter by opportunity type"),
    locality: Optional[str] = Query(None, description="Filter by locality"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get unified list of opportunities across all domains."""
    return await civilian_service.get_opportunities(
        user_id=user.id,
        domain=domain,
        opportunity_type=type,
        locality=locality,
        limit=limit,
        offset=offset
    )


@router.get("/applications", response_model=ApplicationTrackerList)
async def get_my_applications(
    domain: Optional[OpportunityDomain] = Query(None, description="Filter by domain"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get all applications/registrations across domains."""
    return await civilian_service.get_my_applications(
        user_id=user.id,
        domain=domain,
        limit=limit,
        offset=offset
    )


@router.get("/preferences", response_model=UserPreferences)
async def get_preferences(
    user: UserProfile = Depends(get_current_user)
):
    """Get current user's preferences."""
    return await civilian_service.get_preferences(user.id)


@router.patch("/preferences", response_model=UserPreferences)
async def update_preferences(
    preferences: UserPreferencesUpdate,
    user: UserProfile = Depends(get_current_user)
):
    """Update current user's preferences."""
    return await civilian_service.update_preferences(user.id, preferences)
