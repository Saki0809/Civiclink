from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.core.auth.dependencies import get_current_user, require_role
from app.core.auth.models import UserProfile, RoleType
from app.core.chat.models import (
    ChatRoom, ChatMessage, ChatMessageCreate, ChatMessageList, ChatRoomType
)
from app.core.chat.service import chat_service

router = APIRouter(prefix="/chat", tags=["Community Chat"])


@router.get("/rooms/{domain}", response_model=ChatRoom)
async def get_chat_room(
    domain: ChatRoomType,
    user: UserProfile = Depends(get_current_user)
):
    """Get or create a chat room for a domain."""
    # Citizens can access all domains, others only their assigned domain
    if user.role != RoleType.CITIZEN:
        if user.domain.value != domain.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access chat rooms in your assigned domain"
            )
    
    return await chat_service.get_or_create_room(domain)


@router.get("/rooms/{domain}/messages", response_model=ChatMessageList)
async def get_room_messages(
    domain: ChatRoomType,
    limit: int = Query(50, ge=1, le=100),
    before: Optional[str] = Query(None, description="Get messages before this timestamp"),
    user: UserProfile = Depends(get_current_user)
):
    """Get messages from a domain chat room."""
    # Check domain access
    if user.role != RoleType.CITIZEN:
        if user.domain.value != domain.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access chat rooms in your assigned domain"
            )
    
    room = await chat_service.get_or_create_room(domain)
    return await chat_service.get_room_messages(room.id, limit, before)


@router.post("/rooms/{domain}/messages", response_model=ChatMessage)
async def send_message(
    domain: ChatRoomType,
    message: ChatMessageCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Send a message to a domain chat room."""
    # Check domain access
    if user.role != RoleType.CITIZEN:
        if user.domain.value != domain.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only send messages in your assigned domain"
            )
    
    room = await chat_service.get_or_create_room(domain)
    
    # Update message with correct room_id
    message.room_id = room.id
    
    return await chat_service.send_message(
        message=message,
        user_id=user.id,
        user_name=user.full_name,
        user_role=user.role.value
    )


@router.post("/messages/{message_id}/moderate")
async def moderate_message(
    message_id: str,
    user: UserProfile = Depends(require_role([
        RoleType.HOSPITAL_ADMIN,
        RoleType.MUNICIPAL_OFFICER,
        RoleType.SCHOOL_ADMIN,
        RoleType.COLLEGE_ADMIN,
        RoleType.INSTITUTION_ADMIN,
        RoleType.HEALTH_DEPARTMENT
    ]))
):
    """Moderate (hide) a message. Only available to institutional users."""
    success = await chat_service.moderate_message(message_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return {"success": True, "message": "Message has been moderated"}
