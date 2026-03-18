from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.core.notifications.models import NotificationCreate, NotificationType, NotificationPriority
from app.core.notifications.service import notification_service
from app.modules.municipal.models import (
    MunicipalIssue, MunicipalIssueCreate, MunicipalIssueUpdate, MunicipalIssueList,
    IssueUpdate, IssueUpdateCreate, IssueTimeline, IssueStatus, IssuePriority, IssueCategory
)
import uuid


class MunicipalService:
    """Service for municipal domain operations."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    async def create_issue(
        self,
        issue_data: MunicipalIssueCreate,
        citizen_id: str,
        citizen_name: str,
        citizen_phone: Optional[str] = None
    ) -> MunicipalIssue:
        """Create a new municipal issue."""
        issue_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": issue_id,
            "citizen_id": citizen_id,
            "citizen_name": citizen_name,
            "citizen_phone": citizen_phone,
            "title": issue_data.title,
            "description": issue_data.description,
            "category": issue_data.category.value,
            "location_name": issue_data.location_name,
            "address": issue_data.address,
            "locality": issue_data.locality,
            "zone": issue_data.zone,
            "latitude": issue_data.latitude,
            "longitude": issue_data.longitude,
            "images": issue_data.images or [],
            "status": IssueStatus.SUBMITTED.value,
            "priority": IssuePriority.MEDIUM.value,
            "created_at": now,
            "updated_at": now
        }
        
        self.client.table("municipal_issues").insert(data).execute()
        
        # Create initial timeline entry
        await self._add_timeline_entry(
            issue_id=issue_id,
            user_id=citizen_id,
            user_name=citizen_name,
            user_role="citizen",
            message="Issue submitted",
            new_status=IssueStatus.SUBMITTED
        )
        
        # Notify municipal officers in the zone/locality
        await notification_service.broadcast_notification(
            NotificationCreate(
                title=f"New Issue: {issue_data.title}",
                message=f"A new {issue_data.category.value} issue has been reported at {issue_data.location_name}",
                type=NotificationType.ISSUE_CREATED,
                priority=NotificationPriority.MEDIUM,
                domain="municipal",
                metadata={"issue_id": issue_id, "category": issue_data.category.value}
            ),
            domain="municipal",
            locality=issue_data.locality
        )
        
        return MunicipalIssue(
            id=issue_id,
            citizen_id=citizen_id,
            citizen_name=citizen_name,
            citizen_phone=citizen_phone,
            status=IssueStatus.SUBMITTED,
            priority=IssuePriority.MEDIUM,
            created_at=datetime.utcnow(),
            **issue_data.model_dump()
        )
    
    async def get_issues(
        self,
        citizen_id: Optional[str] = None,
        assigned_to: Optional[str] = None,
        locality: Optional[str] = None,
        zone: Optional[str] = None,
        category: Optional[IssueCategory] = None,
        status: Optional[IssueStatus] = None,
        limit: int = 50,
        offset: int = 0
    ) -> MunicipalIssueList:
        """Get municipal issues with filters."""
        query = self.client.table("municipal_issues").select("*")
        
        if citizen_id:
            query = query.eq("citizen_id", citizen_id)
        if assigned_to:
            query = query.eq("assigned_to", assigned_to)
        if locality:
            query = query.eq("locality", locality)
        if zone:
            query = query.eq("zone", zone)
        if category:
            query = query.eq("category", category.value)
        if status:
            query = query.eq("status", status.value)
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Get paginated results
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        issues = []
        for item in (response.data or []):
            issues.append(self._parse_issue(item))
        
        return MunicipalIssueList(issues=issues, total=total)
    
    async def get_issue(self, issue_id: str) -> Optional[MunicipalIssue]:
        """Get a single issue by ID."""
        response = self.client.table("municipal_issues").select("*").eq("id", issue_id).single().execute()
        
        if not response.data:
            return None
        
        return self._parse_issue(response.data)
    
    async def update_issue(
        self,
        issue_id: str,
        update_data: MunicipalIssueUpdate,
        officer_id: str,
        officer_name: str,
        officer_role: str
    ) -> Optional[MunicipalIssue]:
        """Update a municipal issue (status, assignment, etc.)."""
        # Get current issue
        current = await self.get_issue(issue_id)
        if not current:
            return None
        
        now = datetime.utcnow().isoformat()
        data = {"updated_at": now}
        
        old_status = current.status
        message_parts = []
        
        if update_data.status:
            data["status"] = update_data.status.value
            message_parts.append(f"Status changed to {update_data.status.value}")
            
            if update_data.status == IssueStatus.RESOLVED:
                data["resolved_at"] = now
        
        if update_data.priority:
            data["priority"] = update_data.priority.value
            message_parts.append(f"Priority set to {update_data.priority.value}")
        
        if update_data.assigned_to:
            data["assigned_to"] = update_data.assigned_to
            data["assigned_officer_name"] = officer_name
            message_parts.append(f"Assigned to {officer_name}")
        
        if update_data.estimated_resolution_date:
            data["estimated_resolution_date"] = update_data.estimated_resolution_date.isoformat()
            message_parts.append(f"Estimated resolution: {update_data.estimated_resolution_date.date()}")
        
        if update_data.resolution_notes:
            data["resolution_notes"] = update_data.resolution_notes
            message_parts.append(f"Notes: {update_data.resolution_notes}")
        
        self.client.table("municipal_issues").update(data).eq("id", issue_id).execute()
        
        # Add timeline entry
        if message_parts:
            await self._add_timeline_entry(
                issue_id=issue_id,
                user_id=officer_id,
                user_name=officer_name,
                user_role=officer_role,
                message="; ".join(message_parts),
                old_status=old_status,
                new_status=update_data.status
            )
        
        # Notify citizen of update
        notification_type = NotificationType.ISSUE_RESOLVED if update_data.status == IssueStatus.RESOLVED else NotificationType.ISSUE_STATUS_UPDATE
        
        await notification_service.create_notification(
            NotificationCreate(
                user_id=current.citizen_id,
                title=f"Issue Update: {current.title}",
                message="; ".join(message_parts) or "Your issue has been updated",
                type=notification_type,
                priority=NotificationPriority.MEDIUM,
                domain="municipal",
                metadata={"issue_id": issue_id}
            )
        )
        
        return await self.get_issue(issue_id)
    
    async def add_issue_comment(
        self,
        issue_id: str,
        comment: IssueUpdateCreate,
        user_id: str,
        user_name: str,
        user_role: str
    ) -> IssueUpdate:
        """Add a comment to an issue timeline."""
        return await self._add_timeline_entry(
            issue_id=issue_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            message=comment.message,
            new_status=comment.new_status
        )
    
    async def get_issue_timeline(self, issue_id: str) -> IssueTimeline:
        """Get the timeline/history of an issue."""
        response = self.client.table("issue_updates").select("*").eq("issue_id", issue_id).order("created_at", desc=False).execute()
        
        updates = []
        for item in (response.data or []):
            updates.append(IssueUpdate(
                id=item["id"],
                issue_id=item["issue_id"],
                user_id=item["user_id"],
                user_name=item["user_name"],
                user_role=item["user_role"],
                message=item["message"],
                old_status=IssueStatus(item["old_status"]) if item.get("old_status") else None,
                new_status=IssueStatus(item["new_status"]) if item.get("new_status") else None,
                created_at=item["created_at"]
            ))
        
        return IssueTimeline(updates=updates, total=len(updates))
    
    async def _add_timeline_entry(
        self,
        issue_id: str,
        user_id: str,
        user_name: str,
        user_role: str,
        message: str,
        old_status: Optional[IssueStatus] = None,
        new_status: Optional[IssueStatus] = None
    ) -> IssueUpdate:
        """Add an entry to issue timeline."""
        update_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": update_id,
            "issue_id": issue_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role,
            "message": message,
            "old_status": old_status.value if old_status else None,
            "new_status": new_status.value if new_status else None,
            "created_at": now
        }
        
        self.client.table("issue_updates").insert(data).execute()
        
        return IssueUpdate(
            id=update_id,
            issue_id=issue_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            message=message,
            old_status=old_status,
            new_status=new_status,
            created_at=datetime.utcnow()
        )
    
    def _parse_issue(self, item: dict) -> MunicipalIssue:
        return MunicipalIssue(
            id=item["id"],
            citizen_id=item["citizen_id"],
            citizen_name=item["citizen_name"],
            citizen_phone=item.get("citizen_phone"),
            title=item["title"],
            description=item["description"],
            category=IssueCategory(item["category"]),
            location_name=item["location_name"],
            address=item["address"],
            locality=item["locality"],
            zone=item.get("zone"),
            latitude=item.get("latitude"),
            longitude=item.get("longitude"),
            images=item.get("images", []),
            status=IssueStatus(item["status"]),
            priority=IssuePriority(item.get("priority", "medium")),
            assigned_to=item.get("assigned_to"),
            assigned_officer_name=item.get("assigned_officer_name"),
            estimated_resolution_date=item.get("estimated_resolution_date"),
            resolution_notes=item.get("resolution_notes"),
            created_at=item["created_at"],
            updated_at=item.get("updated_at"),
            resolved_at=item.get("resolved_at")
        )


# Singleton instance
municipal_service = MunicipalService()
