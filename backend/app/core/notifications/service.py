from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.core.notifications.models import (
    NotificationCreate, Notification, NotificationList,
    NotificationType, NotificationPriority
)
import uuid


class NotificationService:
    """Service for managing notifications across all domains."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    async def create_notification(self, notification: NotificationCreate) -> Notification:
        """Create a single notification for a specific user."""
        if not notification.user_id:
            raise ValueError("user_id is required for single notification")
        
        notification_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": notification_id,
            "user_id": notification.user_id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.type.value,
            "priority": notification.priority.value,
            "domain": notification.domain,
            "metadata": notification.metadata or {},
            "is_read": False,
            "created_at": now
        }
        
        self.client.table("notifications").insert(data).execute()
        
        return Notification(
            id=notification_id,
            user_id=notification.user_id,
            title=notification.title,
            message=notification.message,
            type=notification.type,
            priority=notification.priority,
            domain=notification.domain,
            metadata=notification.metadata,
            is_read=False,
            created_at=datetime.utcnow()
        )
    
    async def broadcast_notification(
        self,
        notification: NotificationCreate,
        domain: Optional[str] = None,
        locality: Optional[str] = None,
        role: Optional[str] = None
    ) -> int:
        """Broadcast notification to multiple users based on filters."""
        # Build query to get target users
        query = self.client.table("profiles").select("id")
        
        if domain:
            query = query.or_(f"domain.eq.{domain},role.eq.citizen")
        
        if locality:
            query = query.eq("locality", locality)
        
        if role:
            query = query.eq("role", role)
        
        response = query.execute()
        users = response.data or []
        
        if not users:
            return 0
        
        # Create notifications for all target users
        now = datetime.utcnow().isoformat()
        notifications = []
        
        for user in users:
            notifications.append({
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "title": notification.title,
                "message": notification.message,
                "type": notification.type.value,
                "priority": notification.priority.value,
                "domain": notification.domain,
                "metadata": notification.metadata or {},
                "is_read": False,
                "created_at": now
            })
        
        if notifications:
            self.client.table("notifications").insert(notifications).execute()
        
        return len(notifications)
    
    async def get_user_notifications(
        self,
        user_id: str,
        domain: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> NotificationList:
        """Get notifications for a specific user."""
        query = self.client.table("notifications").select("*").eq("user_id", user_id)
        
        if domain:
            query = query.eq("domain", domain)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Get paginated results
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        notifications = []
        unread_count = 0
        
        for item in (response.data or []):
            if not item["is_read"]:
                unread_count += 1
            
            notifications.append(Notification(
                id=item["id"],
                user_id=item["user_id"],
                title=item["title"],
                message=item["message"],
                type=NotificationType(item["type"]),
                priority=NotificationPriority(item["priority"]),
                domain=item["domain"],
                metadata=item.get("metadata"),
                is_read=item["is_read"],
                created_at=item["created_at"],
                read_at=item.get("read_at")
            ))
        
        return NotificationList(
            notifications=notifications,
            total=total,
            unread_count=unread_count
        )
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read."""
        response = self.client.table("notifications").update({
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }).eq("id", notification_id).eq("user_id", user_id).execute()
        
        return bool(response.data)
    
    async def mark_all_as_read(self, user_id: str, domain: Optional[str] = None) -> int:
        """Mark all notifications as read for a user."""
        query = self.client.table("notifications").update({
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("is_read", False)
        
        if domain:
            query = query.eq("domain", domain)
        
        response = query.execute()
        return len(response.data) if response.data else 0


# Singleton instance
notification_service = NotificationService()
