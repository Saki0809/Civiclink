from typing import Optional, List
from datetime import datetime
from app.database import get_supabase_admin_client
from app.core.chat.models import (
    ChatRoom, ChatRoomType, ChatMessage, ChatMessageCreate,
    ChatMessageList, MessageType
)
import uuid


class ChatService:
    """Service for managing domain-based chat rooms and messages."""
    
    def __init__(self):
        self.client = get_supabase_admin_client()
    
    async def get_or_create_room(self, domain: ChatRoomType) -> ChatRoom:
        """Get or create a chat room for a domain."""
        # Check if room exists
        response = self.client.table("chat_rooms").select("*").eq("domain", domain.value).single().execute()
        
        if response.data:
            room_data = response.data
            # Get member count
            member_count = self._get_room_member_count(room_data["id"])
            
            return ChatRoom(
                id=room_data["id"],
                name=room_data["name"],
                domain=ChatRoomType(room_data["domain"]),
                description=room_data.get("description"),
                is_active=room_data.get("is_active", True),
                created_at=room_data["created_at"],
                member_count=member_count
            )
        
        # Create new room
        room_id = str(uuid.uuid4())
        room_name = f"{domain.value.title()} Community"
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": room_id,
            "name": room_name,
            "domain": domain.value,
            "description": f"Community chat for {domain.value} domain",
            "is_active": True,
            "created_at": now
        }
        
        self.client.table("chat_rooms").insert(data).execute()
        
        return ChatRoom(
            id=room_id,
            name=room_name,
            domain=domain,
            description=data["description"],
            is_active=True,
            created_at=datetime.utcnow(),
            member_count=0
        )
    
    def _get_room_member_count(self, room_id: str) -> int:
        """Get the number of unique users who have sent messages in a room."""
        response = self.client.table("chat_messages").select("user_id").eq("room_id", room_id).execute()
        if response.data:
            unique_users = set(msg["user_id"] for msg in response.data)
            return len(unique_users)
        return 0
    
    async def send_message(
        self,
        message: ChatMessageCreate,
        user_id: str,
        user_name: str,
        user_role: str
    ) -> ChatMessage:
        """Send a message to a chat room."""
        message_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        data = {
            "id": message_id,
            "room_id": message.room_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role,
            "content": message.content,
            "message_type": message.message_type.value,
            "is_moderated": False,
            "created_at": now
        }
        
        self.client.table("chat_messages").insert(data).execute()
        
        # Log to audit
        self._log_message_audit(message_id, user_id, "created")
        
        return ChatMessage(
            id=message_id,
            room_id=message.room_id,
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            content=message.content,
            message_type=message.message_type,
            is_moderated=False,
            created_at=datetime.utcnow()
        )
    
    async def get_room_messages(
        self,
        room_id: str,
        limit: int = 50,
        before: Optional[str] = None
    ) -> ChatMessageList:
        """Get messages from a chat room."""
        query = self.client.table("chat_messages").select("*").eq("room_id", room_id).eq("is_moderated", False)
        
        if before:
            query = query.lt("created_at", before)
        
        # Get total count
        count_response = self.client.table("chat_messages").select("id").eq("room_id", room_id).eq("is_moderated", False).execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Get messages
        response = query.order("created_at", desc=True).limit(limit).execute()
        
        messages = []
        for item in reversed(response.data or []):  # Reverse to get chronological order
            messages.append(ChatMessage(
                id=item["id"],
                room_id=item["room_id"],
                user_id=item["user_id"],
                user_name=item["user_name"],
                user_role=item["user_role"],
                content=item["content"],
                message_type=MessageType(item["message_type"]),
                is_moderated=item["is_moderated"],
                created_at=item["created_at"]
            ))
        
        has_more = len(response.data or []) == limit
        
        return ChatMessageList(
            messages=messages,
            total=total,
            has_more=has_more
        )
    
    async def moderate_message(self, message_id: str, moderator_id: str) -> bool:
        """Mark a message as moderated (hidden from view)."""
        response = self.client.table("chat_messages").update({
            "is_moderated": True
        }).eq("id", message_id).execute()
        
        if response.data:
            self._log_message_audit(message_id, moderator_id, "moderated")
            return True
        return False
    
    def _log_message_audit(self, message_id: str, user_id: str, action: str):
        """Log message action to audit trail."""
        self.client.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "entity_type": "chat_message",
            "entity_id": message_id,
            "user_id": user_id,
            "action": action,
            "created_at": datetime.utcnow().isoformat()
        }).execute()


# Singleton instance
chat_service = ChatService()
