from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.core.auth.dependencies import get_current_user, require_role
from app.core.auth.models import UserProfile, RoleType
from app.modules.education.models import (
    JobPosting, JobPostingCreate, JobPostingUpdate, JobPostingList,
    JobApplication, JobApplicationCreate, JobApplicationList,
    ApplicationStatus, ApplicationStatusUpdate, JobType
)
from app.modules.education.service import education_service

router = APIRouter(prefix="/education", tags=["Education"])


# Job Posting Endpoints
@router.post("/jobs", response_model=JobPosting, status_code=status.HTTP_201_CREATED)
async def create_job_posting(
    job_data: JobPostingCreate,
    user: UserProfile = Depends(require_role([
        RoleType.SCHOOL_ADMIN,
        RoleType.COLLEGE_ADMIN,
        RoleType.INSTITUTION_ADMIN
    ]))
):
    """Create a new job posting. Only educational institutions can create postings."""
    return await education_service.create_job_posting(
        job_data=job_data,
        institution_id=user.institution_id or user.id,
        institution_name=user.full_name
    )


@router.get("/jobs", response_model=JobPostingList)
async def list_job_postings(
    job_type: Optional[JobType] = Query(None, description="Filter by job type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    active_only: bool = Query(True, description="Only show active postings"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get list of job postings. Available to all authenticated users."""
    return await education_service.get_job_postings(
        job_type=job_type,
        is_active=active_only,
        location=location,
        limit=limit,
        offset=offset
    )


@router.get("/jobs/my", response_model=JobPostingList)
async def list_my_job_postings(
    active_only: bool = Query(False, description="Only show active postings"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(require_role([
        RoleType.SCHOOL_ADMIN,
        RoleType.COLLEGE_ADMIN,
        RoleType.INSTITUTION_ADMIN
    ]))
):
    """Get job postings created by the current institution."""
    return await education_service.get_job_postings(
        institution_id=user.institution_id or user.id,
        is_active=active_only if active_only else None,
        limit=limit,
        offset=offset
    )


@router.get("/jobs/{job_id}", response_model=JobPosting)
async def get_job_posting(
    job_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Get details of a specific job posting."""
    job = await education_service.get_job_posting(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    return job


# Application Endpoints
@router.post("/jobs/{job_id}/apply", response_model=JobApplication)
async def apply_for_job(
    job_id: str,
    application: JobApplicationCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Apply for a job posting. Available to all authenticated users."""
    # Ensure job_id matches
    application.job_id = job_id
    
    try:
        return await education_service.apply_for_job(
            application=application,
            user_id=user.id,
            user_name=user.full_name,
            user_email=user.email
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/applications/my", response_model=JobApplicationList)
async def list_my_applications(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get applications submitted by the current user."""
    return await education_service.get_user_applications(
        user_id=user.id,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/jobs/{job_id}/applications", response_model=JobApplicationList)
async def list_job_applications(
    job_id: str,
    status: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(require_role([
        RoleType.SCHOOL_ADMIN,
        RoleType.COLLEGE_ADMIN,
        RoleType.INSTITUTION_ADMIN
    ]))
):
    """Get applications for a job posting. Only available to the posting institution."""
    # Verify ownership
    job = await education_service.get_job_posting(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    
    if job.institution_id != (user.institution_id or user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view applications for this job"
        )
    
    return await education_service.get_job_applications(
        job_id=job_id,
        status=status,
        limit=limit,
        offset=offset
    )


@router.patch("/applications/{application_id}/status", response_model=JobApplication)
async def update_application_status(
    application_id: str,
    update: ApplicationStatusUpdate,
    user: UserProfile = Depends(require_role([
        RoleType.SCHOOL_ADMIN,
        RoleType.COLLEGE_ADMIN,
        RoleType.INSTITUTION_ADMIN
    ]))
):
    """Update application status. Only available to the posting institution."""
    try:
        application = await education_service.update_application_status(
            application_id=application_id,
            update=update,
            institution_id=user.institution_id or user.id
        )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return application
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
