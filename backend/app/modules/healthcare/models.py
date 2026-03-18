from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime, date, time


class CampStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RegistrationStatus(str, Enum):
    REGISTERED = "registered"
    CONFIRMED = "confirmed"
    ATTENDED = "attended"
    NO_SHOW = "no_show"
    CANCELLED = "cancelled"


# Medical Camp Models
class MedicalCampBase(BaseModel):
    title: str
    description: str
    camp_date: date
    start_time: time
    end_time: time
    location_name: str
    address: str
    locality: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    services_offered: List[str]
    max_registrations: Optional[int] = None
    volunteers_needed: int = 0


class MedicalCampCreate(MedicalCampBase):
    pass


class MedicalCampUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    camp_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    services_offered: Optional[List[str]] = None
    max_registrations: Optional[int] = None
    volunteers_needed: Optional[int] = None
    status: Optional[CampStatus] = None


class MedicalCamp(MedicalCampBase):
    id: str
    institution_id: str
    institution_name: str
    status: CampStatus
    registered_count: int = 0
    volunteer_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class MedicalCampList(BaseModel):
    camps: List[MedicalCamp]
    total: int


# Camp Registration Models
class CampRegistrationCreate(BaseModel):
    camp_id: str
    phone: str
    notes: Optional[str] = None


class CampRegistration(BaseModel):
    id: str
    camp_id: str
    user_id: str
    user_name: str
    phone: str
    notes: Optional[str] = None
    status: RegistrationStatus
    registered_at: datetime


# Volunteer Models
class VolunteerRegistrationCreate(BaseModel):
    camp_id: str
    skills: List[str]
    availability_notes: Optional[str] = None


class VolunteerRegistration(BaseModel):
    id: str
    camp_id: str
    user_id: str
    user_name: str
    phone: str
    skills: List[str]
    availability_notes: Optional[str] = None
    status: RegistrationStatus
    registered_at: datetime
