from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.core.notifications.models import NotificationCreate, NotificationType, NotificationPriority
from app.core.notifications.service import notification_service
from app.modules.healthcare.models import (
    MedicalCamp, MedicalCampCreate, MedicalCampUpdate, MedicalCampList,
    CampRegistration, CampRegistrationCreate, VolunteerRegistration,
    VolunteerRegistrationCreate, CampStatus, RegistrationStatus
)
import uuid


class HealthcareService:
    """Service for healthcare domain operations."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    # Medical Camp Operations
    async def create_medical_camp(
        self,
        camp_data: MedicalCampCreate,
        institution_id: str,
        institution_name: str
    ) -> MedicalCamp:
        """Create a new medical camp."""
        camp_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": camp_id,
            "institution_id": institution_id,
            "institution_name": institution_name,
            "title": camp_data.title,
            "description": camp_data.description,
            "camp_date": camp_data.camp_date.isoformat(),
            "start_time": camp_data.start_time.isoformat(),
            "end_time": camp_data.end_time.isoformat(),
            "location_name": camp_data.location_name,
            "address": camp_data.address,
            "locality": camp_data.locality,
            "city": camp_data.city,
            "latitude": camp_data.latitude,
            "longitude": camp_data.longitude,
            "services_offered": camp_data.services_offered,
            "max_registrations": camp_data.max_registrations,
            "volunteers_needed": camp_data.volunteers_needed,
            "status": CampStatus.PUBLISHED.value,
            "created_at": now,
            "updated_at": now
        }
        
        self.client.table("medical_camps").insert(data).execute()
        
        # Send location-based notification
        await notification_service.broadcast_notification(
            NotificationCreate(
                title=f"New Medical Camp: {camp_data.title}",
                message=f"{institution_name} is organizing a medical camp at {camp_data.location_name} on {camp_data.camp_date}. Services: {', '.join(camp_data.services_offered[:3])}",
                type=NotificationType.MEDICAL_CAMP_CREATED,
                priority=NotificationPriority.MEDIUM,
                domain="healthcare",
                metadata={"camp_id": camp_id}
            ),
            locality=camp_data.locality
        )
        
        # If volunteers needed, send volunteer request
        if camp_data.volunteers_needed > 0:
            await notification_service.broadcast_notification(
                NotificationCreate(
                    title=f"Volunteers Needed: {camp_data.title}",
                    message=f"{institution_name} needs {camp_data.volunteers_needed} volunteers for a medical camp on {camp_data.camp_date}",
                    type=NotificationType.VOLUNTEER_REQUEST,
                    priority=NotificationPriority.MEDIUM,
                    domain="healthcare",
                    metadata={"camp_id": camp_id}
                ),
                locality=camp_data.locality
            )
        
        return MedicalCamp(
            id=camp_id,
            institution_id=institution_id,
            institution_name=institution_name,
            status=CampStatus.PUBLISHED,
            registered_count=0,
            volunteer_count=0,
            created_at=datetime.utcnow(),
            **camp_data.model_dump()
        )
    
    async def get_medical_camps(
        self,
        locality: Optional[str] = None,
        city: Optional[str] = None,
        status: Optional[CampStatus] = None,
        institution_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> MedicalCampList:
        """Get medical camps with filters."""
        query = self.client.table("medical_camps").select("*")
        
        if locality:
            query = query.eq("locality", locality)
        if city:
            query = query.eq("city", city)
        if status:
            query = query.eq("status", status.value)
        if institution_id:
            query = query.eq("institution_id", institution_id)
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Get paginated results
        response = query.order("camp_date", desc=False).range(offset, offset + limit - 1).execute()
        
        camps = []
        for item in (response.data or []):
            # Get registration counts
            reg_count = self._get_registration_count(item["id"])
            vol_count = self._get_volunteer_count(item["id"])
            
            camps.append(MedicalCamp(
                id=item["id"],
                institution_id=item["institution_id"],
                institution_name=item["institution_name"],
                title=item["title"],
                description=item["description"],
                camp_date=item["camp_date"],
                start_time=item["start_time"],
                end_time=item["end_time"],
                location_name=item["location_name"],
                address=item["address"],
                locality=item["locality"],
                city=item["city"],
                latitude=item.get("latitude"),
                longitude=item.get("longitude"),
                services_offered=item["services_offered"],
                max_registrations=item.get("max_registrations"),
                volunteers_needed=item.get("volunteers_needed", 0),
                status=CampStatus(item["status"]),
                registered_count=reg_count,
                volunteer_count=vol_count,
                created_at=item["created_at"],
                updated_at=item.get("updated_at")
            ))
        
        return MedicalCampList(camps=camps, total=total)
    
    async def get_medical_camp(self, camp_id: str) -> Optional[MedicalCamp]:
        """Get a single medical camp by ID."""
        response = self.client.table("medical_camps").select("*").eq("id", camp_id).single().execute()
        
        if not response.data:
            return None
        
        item = response.data
        reg_count = self._get_registration_count(item["id"])
        vol_count = self._get_volunteer_count(item["id"])
        
        return MedicalCamp(
            id=item["id"],
            institution_id=item["institution_id"],
            institution_name=item["institution_name"],
            title=item["title"],
            description=item["description"],
            camp_date=item["camp_date"],
            start_time=item["start_time"],
            end_time=item["end_time"],
            location_name=item["location_name"],
            address=item["address"],
            locality=item["locality"],
            city=item["city"],
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            services_offered=item["services_offered"],
            max_registrations=item.get("max_registrations"),
            volunteers_needed=item.get("volunteers_needed", 0),
            status=CampStatus(item["status"]),
            registered_count=reg_count,
            volunteer_count=vol_count,
            created_at=item["created_at"],
            updated_at=item.get("updated_at")
        )
    
    def _get_registration_count(self, camp_id: str) -> int:
        response = self.client.table("camp_registrations").select("id").eq("camp_id", camp_id).neq("status", "cancelled").execute()
        return len(response.data) if response.data else 0
    
    def _get_volunteer_count(self, camp_id: str) -> int:
        response = self.client.table("volunteer_registrations").select("id").eq("camp_id", camp_id).neq("status", "cancelled").execute()
        return len(response.data) if response.data else 0
    
    # Registration Operations
    async def register_for_camp(
        self,
        registration: CampRegistrationCreate,
        user_id: str,
        user_name: str
    ) -> CampRegistration:
        """Register a citizen for a medical camp."""
        # Check if already registered
        existing = self.client.table("camp_registrations").select("id").eq("camp_id", registration.camp_id).eq("user_id", user_id).execute()
        
        if existing.data:
            raise ValueError("You are already registered for this camp")
        
        # Check camp capacity
        camp = await self.get_medical_camp(registration.camp_id)
        if camp and camp.max_registrations:
            if camp.registered_count >= camp.max_registrations:
                raise ValueError("This camp has reached maximum capacity")
        
        reg_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": reg_id,
            "camp_id": registration.camp_id,
            "user_id": user_id,
            "user_name": user_name,
            "phone": registration.phone,
            "notes": registration.notes,
            "status": RegistrationStatus.REGISTERED.value,
            "registered_at": now
        }
        
        self.client.table("camp_registrations").insert(data).execute()
        
        # Send confirmation notification
        await notification_service.create_notification(
            NotificationCreate(
                user_id=user_id,
                title="Registration Confirmed",
                message=f"You have been registered for {camp.title} on {camp.camp_date}",
                type=NotificationType.CAMP_REGISTRATION_CONFIRMED,
                priority=NotificationPriority.LOW,
                domain="healthcare",
                metadata={"camp_id": registration.camp_id, "registration_id": reg_id}
            )
        )
        
        return CampRegistration(
            id=reg_id,
            camp_id=registration.camp_id,
            user_id=user_id,
            user_name=user_name,
            phone=registration.phone,
            notes=registration.notes,
            status=RegistrationStatus.REGISTERED,
            registered_at=datetime.utcnow()
        )
    
    # Volunteer Operations
    async def register_as_volunteer(
        self,
        registration: VolunteerRegistrationCreate,
        user_id: str,
        user_name: str,
        phone: str
    ) -> VolunteerRegistration:
        """Register as a volunteer for a medical camp."""
        # Check if already registered
        existing = self.client.table("volunteer_registrations").select("id").eq("camp_id", registration.camp_id).eq("user_id", user_id).execute()
        
        if existing.data:
            raise ValueError("You are already registered as a volunteer for this camp")
        
        reg_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": reg_id,
            "camp_id": registration.camp_id,
            "user_id": user_id,
            "user_name": user_name,
            "phone": phone,
            "skills": registration.skills,
            "availability_notes": registration.availability_notes,
            "status": RegistrationStatus.REGISTERED.value,
            "registered_at": now
        }
        
        self.client.table("volunteer_registrations").insert(data).execute()
        
        return VolunteerRegistration(
            id=reg_id,
            camp_id=registration.camp_id,
            user_id=user_id,
            user_name=user_name,
            phone=phone,
            skills=registration.skills,
            availability_notes=registration.availability_notes,
            status=RegistrationStatus.REGISTERED,
            registered_at=datetime.utcnow()
        )


# Singleton instance
healthcare_service = HealthcareService()
