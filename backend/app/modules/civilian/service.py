from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.modules.civilian.models import (
    Opportunity, OpportunityList, OpportunityType, OpportunityDomain,
    ApplicationTracker, ApplicationTrackerList,
    UserPreferences, UserPreferencesUpdate
)


class CivilianService:
    """Service for civilian (citizen) cross-domain operations."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    async def get_opportunities(
        self,
        user_id: str,
        domain: Optional[OpportunityDomain] = None,
        opportunity_type: Optional[OpportunityType] = None,
        locality: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> OpportunityList:
        """Get unified list of opportunities across all domains."""
        opportunities = []
        
        # Get medical camps from healthcare
        if domain is None or domain == OpportunityDomain.HEALTHCARE:
            camps = await self._get_healthcare_opportunities(user_id, locality, opportunity_type)
            opportunities.extend(camps)
        
        # Get jobs from education
        if domain is None or domain == OpportunityDomain.EDUCATION:
            jobs = await self._get_education_opportunities(user_id, opportunity_type)
            opportunities.extend(jobs)
        
        # Sort by created_at descending
        opportunities.sort(key=lambda x: x.created_at, reverse=True)
        
        total = len(opportunities)
        
        # Apply pagination
        paginated = opportunities[offset:offset + limit]
        
        return OpportunityList(opportunities=paginated, total=total)
    
    async def _get_healthcare_opportunities(
        self,
        user_id: str,
        locality: Optional[str],
        opportunity_type: Optional[OpportunityType]
    ) -> List[Opportunity]:
        """Get healthcare opportunities (camps, volunteer)."""
        opportunities = []
        
        # Skip if filtering for non-healthcare types
        if opportunity_type and opportunity_type not in [OpportunityType.MEDICAL_CAMP, OpportunityType.VOLUNTEER]:
            return opportunities
        
        query = self.client.table("medical_camps").select("*").in_("status", ["published", "ongoing"])
        
        if locality:
            query = query.eq("locality", locality)
        
        response = query.order("camp_date", desc=False).execute()
        
        for camp in (response.data or []):
            # Check if user is registered
            reg_check = self.client.table("camp_registrations").select("id").eq("camp_id", camp["id"]).eq("user_id", user_id).execute()
            is_registered = bool(reg_check.data)
            
            reg_count = len(self.client.table("camp_registrations").select("id").eq("camp_id", camp["id"]).execute().data or [])
            
            if opportunity_type is None or opportunity_type == OpportunityType.MEDICAL_CAMP:
                opportunities.append(Opportunity(
                    id=camp["id"],
                    type=OpportunityType.MEDICAL_CAMP,
                    domain=OpportunityDomain.HEALTHCARE,
                    title=camp["title"],
                    description=camp["description"],
                    organization=camp["institution_name"],
                    location=f"{camp['location_name']}, {camp['locality']}",
                    date=camp["camp_date"],
                    is_registered=is_registered,
                    registration_count=reg_count,
                    created_at=camp["created_at"]
                ))
            
            # Also add as volunteer opportunity if volunteers needed
            if camp.get("volunteers_needed", 0) > 0:
                if opportunity_type is None or opportunity_type == OpportunityType.VOLUNTEER:
                    vol_check = self.client.table("volunteer_registrations").select("id").eq("camp_id", camp["id"]).eq("user_id", user_id).execute()
                    is_vol_registered = bool(vol_check.data)
                    
                    opportunities.append(Opportunity(
                        id=f"{camp['id']}_volunteer",
                        type=OpportunityType.VOLUNTEER,
                        domain=OpportunityDomain.HEALTHCARE,
                        title=f"Volunteer: {camp['title']}",
                        description=f"Volunteers needed ({camp['volunteers_needed']}): {camp['description']}",
                        organization=camp["institution_name"],
                        location=f"{camp['location_name']}, {camp['locality']}",
                        date=camp["camp_date"],
                        is_registered=is_vol_registered,
                        registration_count=0,
                        created_at=camp["created_at"]
                    ))
        
        return opportunities
    
    async def _get_education_opportunities(
        self,
        user_id: str,
        opportunity_type: Optional[OpportunityType]
    ) -> List[Opportunity]:
        """Get education opportunities (jobs, internships, etc.)."""
        opportunities = []
        
        # Map opportunity types to job types
        type_map = {
            OpportunityType.JOB: ["full_time", "part_time", "contract"],
            OpportunityType.INTERNSHIP: ["internship"],
            OpportunityType.TRAINING: ["training"],
            OpportunityType.SCHOLARSHIP: ["scholarship"]
        }
        
        query = self.client.table("job_postings").select("*").eq("is_active", True)
        
        if opportunity_type and opportunity_type in type_map:
            query = query.in_("job_type", type_map[opportunity_type])
        elif opportunity_type:
            # Skip if filtering for healthcare types
            return opportunities
        
        response = query.order("created_at", desc=True).execute()
        
        for job in (response.data or []):
            # Check if user has applied
            app_check = self.client.table("job_applications").select("id").eq("job_id", job["id"]).eq("user_id", user_id).execute()
            is_applied = bool(app_check.data)
            
            app_count = len(self.client.table("job_applications").select("id").eq("job_id", job["id"]).execute().data or [])
            
            # Determine opportunity type
            opp_type = OpportunityType.JOB
            if job["job_type"] == "internship":
                opp_type = OpportunityType.INTERNSHIP
            elif job["job_type"] == "training":
                opp_type = OpportunityType.TRAINING
            elif job["job_type"] == "scholarship":
                opp_type = OpportunityType.SCHOLARSHIP
            
            opportunities.append(Opportunity(
                id=job["id"],
                type=opp_type,
                domain=OpportunityDomain.EDUCATION,
                title=job["title"],
                description=job["description"],
                organization=job["institution_name"],
                location=job["location"],
                deadline=job["application_deadline"],
                is_registered=is_applied,
                registration_count=app_count,
                created_at=job["created_at"]
            ))
        
        return opportunities
    
    async def get_my_applications(
        self,
        user_id: str,
        domain: Optional[OpportunityDomain] = None,
        limit: int = 50,
        offset: int = 0
    ) -> ApplicationTrackerList:
        """Get all applications/registrations for a user across domains."""
        applications = []
        
        # Healthcare registrations
        if domain is None or domain == OpportunityDomain.HEALTHCARE:
            camp_regs = self.client.table("camp_registrations").select("*, medical_camps(title, institution_name)").eq("user_id", user_id).execute()
            
            for reg in (camp_regs.data or []):
                camp = reg.get("medical_camps", {})
                applications.append(ApplicationTracker(
                    id=reg["id"],
                    type=OpportunityType.MEDICAL_CAMP,
                    domain=OpportunityDomain.HEALTHCARE,
                    title=camp.get("title", "Medical Camp"),
                    organization=camp.get("institution_name", "Unknown"),
                    status=reg["status"],
                    applied_at=reg["registered_at"],
                    updated_at=None
                ))
            
            vol_regs = self.client.table("volunteer_registrations").select("*, medical_camps(title, institution_name)").eq("user_id", user_id).execute()
            
            for reg in (vol_regs.data or []):
                camp = reg.get("medical_camps", {})
                applications.append(ApplicationTracker(
                    id=reg["id"],
                    type=OpportunityType.VOLUNTEER,
                    domain=OpportunityDomain.HEALTHCARE,
                    title=f"Volunteer: {camp.get('title', 'Medical Camp')}",
                    organization=camp.get("institution_name", "Unknown"),
                    status=reg["status"],
                    applied_at=reg["registered_at"],
                    updated_at=None
                ))
        
        # Education applications
        if domain is None or domain == OpportunityDomain.EDUCATION:
            job_apps = self.client.table("job_applications").select("*").eq("user_id", user_id).execute()
            
            for app in (job_apps.data or []):
                applications.append(ApplicationTracker(
                    id=app["id"],
                    type=OpportunityType.JOB,
                    domain=OpportunityDomain.EDUCATION,
                    title=app["job_title"],
                    organization=app["institution_name"],
                    status=app["status"],
                    applied_at=app["applied_at"],
                    updated_at=app.get("updated_at")
                ))
        
        # Sort by applied_at descending
        applications.sort(key=lambda x: x.applied_at, reverse=True)
        
        total = len(applications)
        paginated = applications[offset:offset + limit]
        
        return ApplicationTrackerList(applications=paginated, total=total)
    
    async def get_preferences(self, user_id: str) -> UserPreferences:
        """Get user preferences."""
        response = self.client.table("user_preferences").select("*").eq("user_id", user_id).single().execute()
        
        if response.data:
            return UserPreferences(
                preferred_domains=response.data.get("preferred_domains", []),
                preferred_localities=response.data.get("preferred_localities", []),
                notification_enabled=response.data.get("notification_enabled", True),
                email_notifications=response.data.get("email_notifications", False)
            )
        
        # Return defaults if no preferences exist
        return UserPreferences()
    
    async def update_preferences(
        self,
        user_id: str,
        preferences: UserPreferencesUpdate
    ) -> UserPreferences:
        """Update user preferences."""
        # Check if preferences exist
        existing = self.client.table("user_preferences").select("id").eq("user_id", user_id).execute()
        
        data = {k: v for k, v in preferences.model_dump().items() if v is not None}
        
        if existing.data:
            self.client.table("user_preferences").update(data).eq("user_id", user_id).execute()
        else:
            data["user_id"] = user_id
            self.client.table("user_preferences").insert(data).execute()
        
        return await self.get_preferences(user_id)


# Singleton instance
civilian_service = CivilianService()
