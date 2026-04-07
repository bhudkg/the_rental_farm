import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import User
from schemas import NotificationOut, UnreadCountOut

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(
    page: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    per_page = 20
    skip = (max(page, 1) - 1) * per_page
    return crud.get_notifications_for_user(db, current_user.id, skip=skip, limit=per_page)


@router.get("/unread-count", response_model=UnreadCountOut)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    count = crud.get_unread_count(db, current_user.id)
    return UnreadCountOut(count=count)


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    notif = crud.mark_notification_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    count = crud.mark_all_read(db, current_user.id)
    return {"marked": count}
