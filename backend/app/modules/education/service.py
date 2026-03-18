from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.core.notifications.models import NotificationCreate, NotificationType, NotificationPriority
from app.core.notifications.service import notification_service
from app.modules.education.models import (
    JobPosting, JobPostingCreate, JobPostingUpdate, JobPostingList,
    JobApplication, JobApplicationCreate, JobApplicationList,
    ApplicationStatus, ApplicationStatusUpdate, JobType
)
import uuid


class EducationService:
    """Service for education domain operations."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    # Job Posting Operations
    async def create_job_posting(
        self,
        job_data: JobPostingCreate,
        institution_id: str,
        institution_name: str
    ) -> JobPosting:
        """Create a new job posting."""
        job_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": job_id,
            "institution_id": institution_id,
            "institution_name": institution_name,
            "title": job_data.title,
            "description": job_data.description,
            "job_type": job_data.job_type.value,
            "department": job_data.department,
            "location": job_data.location,
            "is_remote": job_data.is_remote,
            "salary_range": job_data.salary_range,
            "eligibility": job_data.eligibility,
            "requirements": job_data.requirements,
            "responsibilities": job_data.responsibilities,
            "benefits": job_data.benefits or [],
            "application_deadline": job_data.application_deadline.isoformat(),
            "positions_available": job_data.positions_available,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }
        
        self.client.table("job_postings").insert(data).execute()
        
        # Broadcast notification
        await notification_service.broadcast_notification(
            NotificationCreate(
                title=f"New Opportunity: {job_data.title}",
                message=f"{institution_name} is hiring for {job_data.title} ({job_data.job_type.value}). Apply by {job_data.application_deadline}",
                type=NotificationType.JOB_POSTED,
                priority=NotificationPriority.MEDIUM,
                domain="education",
                metadata={"job_id": job_id, "job_type": job_data.job_type.value}
            ),
            domain="education"
        )
        
        return JobPosting(
            id=job_id,
            institution_id=institution_id,
            institution_name=institution_name,
            is_active=True,
            application_count=0,
            created_at=datetime.utcnow(),
            **job_data.model_dump()
        )
    
    async def get_job_postings(
        self,
        institution_id: Optional[str] = None,
        job_type: Optional[JobType] = None,
        is_active: bool = True,
        location: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> JobPostingList:
        """Get job postings with filters."""
        query = self.client.table("job_postings").select("*")
        
        if institution_id:
            query = query.eq("institution_id", institution_id)
        if job_type:
            query = query.eq("job_type", job_type.value)
        if is_active is not None:
            query = query.eq("is_active", is_active)
        if location:
            query = query.ilike("location", f"%{location}%")
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Get paginated results
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        jobs = []
        for item in (response.data or []):
            app_count = self._get_application_count(item["id"])
            jobs.append(self._parse_job(item, app_count))
        
        return JobPostingList(jobs=jobs, total=total)
    
    async def get_job_posting(self, job_id: str) -> Optional[JobPosting]:
        """Get a single job posting by ID."""
        response = self.client.table("job_postings").select("*").eq("id", job_id).single().execute()
        
        if not response.data:
            return None
        
        app_count = self._get_application_count(job_id)
        return self._parse_job(response.data, app_count)
    
    def _get_application_count(self, job_id: str) -> int:
        response = self.client.table("job_applications").select("id").eq("job_id", job_id).neq("status", "withdrawn").execute()
        return len(response.data) if response.data else 0
    
    def _parse_job(self, item: dict, app_count: int) -> JobPosting:
        return JobPosting(
            id=item["id"],
            institution_id=item["institution_id"],
            institution_name=item["institution_name"],
            title=item["title"],
            description=item["description"],
            job_type=JobType(item["job_type"]),
            department=item.get("department"),
            location=item["location"],
            is_remote=item.get("is_remote", False),
            salary_range=item.get("salary_range"),
            eligibility=item["eligibility"],
            requirements=item["requirements"],
            responsibilities=item["responsibilities"],
            benefits=item.get("benefits", []),
            application_deadline=item["application_deadline"],
            positions_available=item.get("positions_available", 1),
            is_active=item.get("is_active", True),
            application_count=app_count,
            created_at=item["created_at"],
            updated_at=item.get("updated_at")
        )
    
    # Application Operations
    async def apply_for_job(
        self,
        application: JobApplicationCreate,
        user_id: str,
        user_name: str,
        user_email: str
    ) -> JobApplication:
        """Apply for a job posting."""
        # Check if already applied
        existing = self.client.table("job_applications").select("id").eq("job_id", application.job_id).eq("user_id", user_id).execute()
        
        if existing.data:
            raise ValueError("You have already applied for this job")
        
        # Get job details
        job = await self.get_job_posting(application.job_id)
        if not job:
            raise ValueError("Job posting not found")
        
        if not job.is_active:
            raise ValueError("This job posting is no longer accepting applications")
        
        app_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": app_id,
            "job_id": application.job_id,
            "job_title": job.title,
            "institution_name": job.institution_name,
            "user_id": user_id,
            "user_name": user_name,
            "user_email": user_email,
            "cover_letter": application.cover_letter,
            "resume_url": application.resume_url,
            "additional_info": application.additional_info,
            "status": ApplicationStatus.SUBMITTED.value,
            "applied_at": now,
            "updated_at": now
        }
        
        self.client.table("job_applications").insert(data).execute()
        
        return JobApplication(
            id=app_id,
            job_id=application.job_id,
            job_title=job.title,
            institution_name=job.institution_name,
            user_id=user_id,
            user_name=user_name,
            user_email=user_email,
            cover_letter=application.cover_letter,
            resume_url=application.resume_url,
            additional_info=application.additional_info,
            status=ApplicationStatus.SUBMITTED,
            applied_at=datetime.utcnow()
        )
    
    async def get_user_applications(
        self,
        user_id: str,
        status: Optional[ApplicationStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> JobApplicationList:
        """Get applications submitted by a user."""
        query = self.client.table("job_applications").select("*").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status.value)
        
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        response = query.order("applied_at", desc=True).range(offset, offset + limit - 1).execute()
        
        applications = [self._parse_application(item) for item in (response.data or [])]
        
        return JobApplicationList(applications=applications, total=total)
    
    async def get_job_applications(
        self,
        job_id: str,
        status: Optional[ApplicationStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> JobApplicationList:
        """Get applications for a job posting."""
        query = self.client.table("job_applications").select("*").eq("job_id", job_id)
        
        if status:
            query = query.eq("status", status.value)
        
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        response = query.order("applied_at", desc=True).range(offset, offset + limit - 1).execute()
        
        applications = [self._parse_application(item) for item in (response.data or [])]
        
        return JobApplicationList(applications=applications, total=total)
    
    async def update_application_status(
        self,
        application_id: str,
        update: ApplicationStatusUpdate,
        institution_id: str
    ) -> Optional[JobApplication]:
        """Update application status (by institution)."""
        # Get application
        response = self.client.table("job_applications").select("*").eq("id", application_id).single().execute()
        
        if not response.data:
            return None
        
        app_data = response.data
        
        # Verify job belongs to institution
        job = await self.get_job_posting(app_data["job_id"])
        if not job or job.institution_id != institution_id:
            raise ValueError("You don't have permission to update this application")
        
        now = datetime.utcnow().isoformat()
        
        self.client.table("job_applications").update({
            "status": update.status.value,
            "status_notes": update.notes,
            "updated_at": now
        }).eq("id", application_id).execute()
        
        # Notify applicant
        await notification_service.create_notification(
            NotificationCreate(
                user_id=app_data["user_id"],
                title=f"Application Update: {app_data['job_title']}",
                message=f"Your application status has been updated to: {update.status.value}",
                type=NotificationType.APPLICATION_STATUS_UPDATE,
                priority=NotificationPriority.HIGH,
                domain="education",
                metadata={"application_id": application_id, "job_id": app_data["job_id"]}
            )
        )
        
        # Get updated application
        updated = self.client.table("job_applications").select("*").eq("id", application_id).single().execute()
        return self._parse_application(updated.data) if updated.data else None
    
    def _parse_application(self, item: dict) -> JobApplication:
        return JobApplication(
            id=item["id"],
            job_id=item["job_id"],
            job_title=item["job_title"],
            institution_name=item["institution_name"],
            user_id=item["user_id"],
            user_name=item["user_name"],
            user_email=item["user_email"],
            cover_letter=item.get("cover_letter"),
            resume_url=item.get("resume_url"),
            additional_info=item.get("additional_info"),
            status=ApplicationStatus(item["status"]),
            status_notes=item.get("status_notes"),
            applied_at=item["applied_at"],
            updated_at=item.get("updated_at")
        )


# Singleton instance
education_service = EducationService()
