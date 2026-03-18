from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class IssueCategory(str, Enum):
    ROADS = "roads"
    WATER_SUPPLY = "water_supply"
    SEWAGE = "sewage"
    ELECTRICITY = "electricity"
    GARBAGE = "garbage"
    STREET_LIGHTS = "street_lights"
    DRAINAGE = "drainage"
    PUBLIC_PROPERTY = "public_property"
    NOISE_POLLUTION = "noise_pollution"
    ENCROACHMENT = "encroachment"
    OTHER = "other"


class IssuePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueStatus(str, Enum):
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REJECTED = "rejected"


# Issue Models
class MunicipalIssueBase(BaseModel):
    title: str
    description: str
    category: IssueCategory
    location_name: str
    address: str
    locality: str
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None


class MunicipalIssueCreate(MunicipalIssueBase):
    pass


class MunicipalIssueUpdate(BaseModel):
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    assigned_to: Optional[str] = None
    estimated_resolution_date: Optional[datetime] = None
    resolution_notes: Optional[str] = None


class MunicipalIssue(MunicipalIssueBase):
    id: str
    citizen_id: str
    citizen_name: str
    citizen_phone: Optional[str] = None
    status: IssueStatus
    priority: IssuePriority = IssuePriority.MEDIUM
    assigned_to: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    estimated_resolution_date: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class MunicipalIssueList(BaseModel):
    issues: List[MunicipalIssue]
    total: int


# Issue Update/Timeline Models
class IssueUpdateCreate(BaseModel):
    message: str
    new_status: Optional[IssueStatus] = None


class IssueUpdate(BaseModel):
    id: str
    issue_id: str
    user_id: str
    user_name: str
    user_role: str
    message: str
    old_status: Optional[IssueStatus] = None
    new_status: Optional[IssueStatus] = None
    created_at: datetime


class IssueTimeline(BaseModel):
    updates: List[IssueUpdate]
    total: int
