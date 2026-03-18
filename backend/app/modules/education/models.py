from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime, date


class JobType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    VOLUNTEER = "volunteer"
    SCHOLARSHIP = "scholarship"
    TRAINING = "training"


class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


# Job Posting Models
class JobPostingBase(BaseModel):
    title: str
    description: str
    job_type: JobType
    department: Optional[str] = None
    location: str
    is_remote: bool = False
    salary_range: Optional[str] = None
    eligibility: List[str]
    requirements: List[str]
    responsibilities: List[str]
    benefits: Optional[List[str]] = None
    application_deadline: date
    positions_available: int = 1


class JobPostingCreate(JobPostingBase):
    pass


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    is_active: Optional[bool] = None
    application_deadline: Optional[date] = None
    positions_available: Optional[int] = None


class JobPosting(JobPostingBase):
    id: str
    institution_id: str
    institution_name: str
    is_active: bool = True
    application_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class JobPostingList(BaseModel):
    jobs: List[JobPosting]
    total: int


# Application Models
class JobApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    additional_info: Optional[str] = None


class JobApplication(BaseModel):
    id: str
    job_id: str
    job_title: str
    institution_name: str
    user_id: str
    user_name: str
    user_email: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    additional_info: Optional[str] = None
    status: ApplicationStatus
    status_notes: Optional[str] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None


class JobApplicationList(BaseModel):
    applications: List[JobApplication]
    total: int


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None
