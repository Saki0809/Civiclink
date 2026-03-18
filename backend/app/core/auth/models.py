from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class DomainType(str, Enum):
    HEALTHCARE = "healthcare"
    MUNICIPAL = "municipal"
    EDUCATION = "education"
    CIVILIAN = "civilian"


class RoleType(str, Enum):
    # Civilian roles
    CITIZEN = "citizen"
    
    # Healthcare roles
    HOSPITAL_ADMIN = "hospital_admin"
    MEDICAL_NGO = "medical_ngo"
    HEALTH_DEPARTMENT = "health_department"
    
    # Municipal roles
    MUNICIPAL_OFFICER = "municipal_officer"
    INSPECTOR = "inspector"
    FIELD_WORKER = "field_worker"
    
    # Education roles
    SCHOOL_ADMIN = "school_admin"
    COLLEGE_ADMIN = "college_admin"
    INSTITUTION_ADMIN = "institution_admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    domain: DomainType
    role: RoleType = RoleType.CITIZEN


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    domain: DomainType


class UserProfile(UserBase):
    id: str
    domain: DomainType
    role: RoleType
    is_active: bool = True
    created_at: datetime
    locality: Optional[str] = None
    zone: Optional[str] = None
    institution_id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserProfile


class TokenRefresh(BaseModel):
    refresh_token: str
