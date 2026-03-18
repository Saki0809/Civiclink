from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class NotificationType(str, Enum):
    # Healthcare notifications
    MEDICAL_CAMP_CREATED = "medical_camp_created"
    VOLUNTEER_REQUEST = "volunteer_request"
    CAMP_REGISTRATION_CONFIRMED = "camp_registration_confirmed"
    
    # Municipal notifications
    ISSUE_CREATED = "issue_created"
    ISSUE_STATUS_UPDATE = "issue_status_update"
    ISSUE_RESOLVED = "issue_resolved"
    RESOLUTION_TIME_UPDATE = "resolution_time_update"
    
    # Education notifications
    JOB_POSTED = "job_posted"
    APPLICATION_STATUS_UPDATE = "application_status_update"
    
    # General notifications
    CHAT_ANNOUNCEMENT = "chat_announcement"
    SYSTEM = "system"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    domain: str
    metadata: Optional[dict] = None


class NotificationCreate(NotificationBase):
    user_id: Optional[str] = None  # If None, broadcast to all users in domain/locality
    locality: Optional[str] = None  # Target specific locality
    role: Optional[str] = None  # Target specific role


class Notification(NotificationBase):
    id: str
    user_id: str
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationList(BaseModel):
    notifications: List[Notification]
    total: int
    unread_count: int
