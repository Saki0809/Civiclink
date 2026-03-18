from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class ChatRoomType(str, Enum):
    HEALTHCARE = "healthcare"
    MUNICIPAL = "municipal"
    EDUCATION = "education"


class MessageType(str, Enum):
    TEXT = "text"
    ANNOUNCEMENT = "announcement"
    SYSTEM = "system"


class ChatRoomBase(BaseModel):
    name: str
    domain: ChatRoomType
    description: Optional[str] = None


class ChatRoom(ChatRoomBase):
    id: str
    is_active: bool = True
    created_at: datetime
    member_count: int = 0


class ChatMessageBase(BaseModel):
    content: str
    message_type: MessageType = MessageType.TEXT


class ChatMessageCreate(ChatMessageBase):
    room_id: str


class ChatMessage(ChatMessageBase):
    id: str
    room_id: str
    user_id: str
    user_name: str
    user_role: str
    is_moderated: bool = False
    created_at: datetime


class ChatMessageList(BaseModel):
    messages: List[ChatMessage]
    total: int
    has_more: bool
