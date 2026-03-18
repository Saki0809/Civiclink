from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.auth.dependencies import get_current_user
from app.core.auth.models import UserProfile
from app.core.notifications.models import NotificationList
from app.core.notifications.service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationList)
async def get_notifications(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: UserProfile = Depends(get_current_user)
):
    """Get current user's notifications."""
    return await notification_service.get_user_notifications(
        user_id=user.id,
        domain=domain,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Mark a notification as read."""
    success = await notification_service.mark_as_read(notification_id, user.id)
    return {"success": success}


@router.post("/read-all")
async def mark_all_notifications_read(
    domain: Optional[str] = Query(None, description="Only mark notifications from this domain"),
    user: UserProfile = Depends(get_current_user)
):
    """Mark all notifications as read."""
    count = await notification_service.mark_all_as_read(user.id, domain)
    return {"marked_count": count}
