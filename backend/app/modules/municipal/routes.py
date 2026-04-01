from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.core.auth.dependencies import get_current_user, require_role
from app.core.auth.models import UserProfile, RoleType
from app.modules.municipal.models import (
    MunicipalIssue, MunicipalIssueCreate, MunicipalIssueUpdate, MunicipalIssueList,
    IssueUpdate, IssueUpdateCreate, IssueTimeline, IssueStatus, IssueCategory
)
from app.modules.municipal.service import municipal_service

router = APIRouter(prefix="/municipal", tags=["Municipal"])


# Issue Endpoints
@router.post("/issues", response_model=MunicipalIssue, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_data: MunicipalIssueCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Create a new municipal issue. Available to all citizens."""
    return await municipal_service.create_issue(
        issue_data=issue_data,
        citizen_id=user.id,
        citizen_name=user.full_name,
        citizen_phone=user.phone
    )


@router.get("/issues", response_model=MunicipalIssueList)
async def list_issues(
    locality: Optional[str] = Query(None, description="Filter by locality"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    category: Optional[IssueCategory] = Query(None, description="Filter by category"),
    status: Optional[IssueStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get list of municipal issues."""
    # Municipal officers see all issues in their zone/locality
    # Citizens see all public issues
    return await municipal_service.get_issues(
        locality=locality,
        zone=zone,
        category=category,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/issues/my", response_model=MunicipalIssueList)
async def list_my_issues(
    status: Optional[IssueStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get issues created by the current user."""
    return await municipal_service.get_issues(
        citizen_id=user.id,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/issues/assigned", response_model=MunicipalIssueList)
async def list_assigned_issues(
    status: Optional[IssueStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(require_role([
        RoleType.MUNICIPAL_OFFICER,
        RoleType.INSPECTOR,
        RoleType.FIELD_WORKER
    ]))
):
    """Get issues assigned to the current officer."""
    return await municipal_service.get_issues(
        assigned_to=user.id,
        status=status,
        limit=limit,
        offset=offset
    )


@router.get("/issues/{issue_id}", response_model=MunicipalIssue)
async def get_issue(
    issue_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Get details of a specific issue."""
    issue = await municipal_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    return issue


@router.patch("/issues/{issue_id}", response_model=MunicipalIssue)
async def update_issue(
    issue_id: str,
    update_data: MunicipalIssueUpdate,
    user: UserProfile = Depends(require_role([
        RoleType.MUNICIPAL_OFFICER,
        RoleType.INSPECTOR,
        RoleType.FIELD_WORKER
    ]))
):
    """Update an issue. Only municipal officers can update issues."""
    issue = await municipal_service.update_issue(
        issue_id=issue_id,
        update_data=update_data,
        officer_id=user.id,
        officer_name=user.full_name,
        officer_role=user.role.value
    )
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    return issue


# Timeline Endpoints
@router.get("/issues/{issue_id}/timeline", response_model=IssueTimeline)
async def get_issue_timeline(
    issue_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Get the timeline/history of an issue."""
    return await municipal_service.get_issue_timeline(issue_id)


@router.post("/issues/{issue_id}/comments", response_model=IssueUpdate)
async def add_issue_comment(
    issue_id: str,
    comment: IssueUpdateCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Add a comment to an issue. Available to all participants."""
    # Verify issue exists
    issue = await municipal_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Only citizen who created or assigned officer can comment
    is_owner = issue.citizen_id == user.id
    is_assigned = issue.assigned_to == user.id
    is_officer = user.role in [RoleType.MUNICIPAL_OFFICER, RoleType.INSPECTOR, RoleType.FIELD_WORKER]
    
    if not (is_owner or is_assigned or is_officer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to comment on this issue"
        )
    
    return await municipal_service.add_issue_comment(
        issue_id=issue_id,
        comment=comment,
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role.value
    )


@router.post("/issues/seed", response_model=MunicipalIssueList)
async def seed_issues(
    user: UserProfile = Depends(get_current_user)
):
    """Seed mock municipal issues for the current user."""
    issues = await municipal_service.seed_mock_issues(
        user_id=user.id,
        user_name=user.full_name,
        user_phone=user.phone
    )
    return MunicipalIssueList(issues=issues, total=len(issues))
