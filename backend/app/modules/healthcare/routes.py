from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.core.auth.dependencies import get_current_user, require_domain, require_role
from app.core.auth.models import UserProfile, DomainType, RoleType
from app.modules.healthcare.models import (
    MedicalCamp, MedicalCampCreate, MedicalCampUpdate, MedicalCampList,
    CampRegistration, CampRegistrationCreate, VolunteerRegistration,
    VolunteerRegistrationCreate, CampStatus
)
from app.modules.healthcare.service import healthcare_service

router = APIRouter(prefix="/healthcare", tags=["Healthcare"])


# Medical Camp Endpoints
@router.post("/camps", response_model=MedicalCamp, status_code=status.HTTP_201_CREATED)
async def create_medical_camp(
    camp_data: MedicalCampCreate,
    user: UserProfile = Depends(require_role([
        RoleType.HOSPITAL_ADMIN,
        RoleType.MEDICAL_NGO,
        RoleType.HEALTH_DEPARTMENT
    ]))
):
    """Create a new medical camp. Only healthcare institutions can create camps."""
    return await healthcare_service.create_medical_camp(
        camp_data=camp_data,
        institution_id=user.institution_id or user.id,
        institution_name=user.full_name
    )


@router.get("/camps", response_model=MedicalCampList)
async def list_medical_camps(
    locality: Optional[str] = Query(None, description="Filter by locality"),
    city: Optional[str] = Query(None, description="Filter by city"),
    status: Optional[CampStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get list of medical camps. Available to all authenticated users."""
    return await healthcare_service.get_medical_camps(
        locality=locality,
        city=city,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/camps/my", response_model=MedicalCampList)
async def list_my_medical_camps(
    status: Optional[CampStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(require_role([
        RoleType.HOSPITAL_ADMIN,
        RoleType.MEDICAL_NGO,
        RoleType.HEALTH_DEPARTMENT
    ]))
):
    """Get medical camps created by the current institution."""
    return await healthcare_service.get_medical_camps(
        institution_id=user.institution_id or user.id,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/camps/{camp_id}", response_model=MedicalCamp)
async def get_medical_camp(
    camp_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Get details of a specific medical camp."""
    camp = await healthcare_service.get_medical_camp(camp_id)
    if not camp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical camp not found"
        )
    return camp


# Registration Endpoints
@router.post("/camps/{camp_id}/register", response_model=CampRegistration)
async def register_for_camp(
    camp_id: str,
    registration: CampRegistrationCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Register for a medical camp. Available to all authenticated users."""
    # Ensure camp_id matches
    registration.camp_id = camp_id
    
    try:
        return await healthcare_service.register_for_camp(
            registration=registration,
            user_id=user.id,
            user_name=user.full_name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Volunteer Endpoints
@router.post("/camps/{camp_id}/volunteer", response_model=VolunteerRegistration)
async def register_as_volunteer(
    camp_id: str,
    registration: VolunteerRegistrationCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Register as a volunteer for a medical camp."""
    # Ensure camp_id matches
    registration.camp_id = camp_id
    
    try:
        return await healthcare_service.register_as_volunteer(
            registration=registration,
            user_id=user.id,
            user_name=user.full_name,
            phone=user.phone or ""
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
