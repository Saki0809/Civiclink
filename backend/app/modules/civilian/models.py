from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class OpportunityType(str, Enum):
    MEDICAL_CAMP = "medical_camp"
    VOLUNTEER = "volunteer"
    JOB = "job"
    INTERNSHIP = "internship"
    TRAINING = "training"
    SCHOLARSHIP = "scholarship"


class OpportunityDomain(str, Enum):
    HEALTHCARE = "healthcare"
    MUNICIPAL = "municipal"
    EDUCATION = "education"


# Unified Opportunity View
class Opportunity(BaseModel):
    id: str
    type: OpportunityType
    domain: OpportunityDomain
    title: str
    description: str
    organization: str
    location: str
    date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    is_registered: bool = False
    registration_count: int = 0
    created_at: datetime


class OpportunityList(BaseModel):
    opportunities: List[Opportunity]
    total: int


# Application Tracker
class ApplicationTracker(BaseModel):
    id: str
    type: OpportunityType
    domain: OpportunityDomain
    title: str
    organization: str
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None


class ApplicationTrackerList(BaseModel):
    applications: List[ApplicationTracker]
    total: int


# User Preferences
class UserPreferences(BaseModel):
    preferred_domains: List[str] = []
    preferred_localities: List[str] = []
    notification_enabled: bool = True
    email_notifications: bool = False


class UserPreferencesUpdate(BaseModel):
    preferred_domains: Optional[List[str]] = None
    preferred_localities: Optional[List[str]] = None
    notification_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None
