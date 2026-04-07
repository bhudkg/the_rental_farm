import re
import uuid
import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import User
from schemas import OrderUpdateCreate, OrderUpdateOut

router = APIRouter(prefix="/api", tags=["updates"])

CLOUDINARY_MEDIA_PATTERN = re.compile(
    r"^https://res\.cloudinary\.com/.+\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$",
    re.IGNORECASE,
)


def _calculate_week_number(active_since: datetime) -> int:
    now = datetime.now(timezone.utc)
    delta = now - active_since
    return max(1, math.ceil(delta.days / 7) or 1)


@router.post(
    "/orders/{order_id}/updates",
    response_model=OrderUpdateOut,
    status_code=status.HTTP_201_CREATED,
)
def post_order_update(
    order_id: uuid.UUID,
    body: OrderUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "active":
        raise HTTPException(status_code=400, detail="Updates can only be posted for active orders")

    tree = crud.get_tree(db, order.tree_id)
    if not tree or tree.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized — you don't own this tree")

    url = body.media_url.strip()
    if not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="Media URL must use HTTPS")

    if not CLOUDINARY_MEDIA_PATTERN.match(url.split("?")[0]):
        raise HTTPException(status_code=400, detail="Only Cloudinary media URLs are accepted")

    if body.media_type == "video" and body.duration_seconds and body.duration_seconds > 60:
        raise HTTPException(status_code=400, detail="Video must be 1 minute or less")

    week_number = _calculate_week_number(order.active_since)

    existing = crud.get_update_for_week(db, order_id, week_number)
    if existing:
        raise HTTPException(status_code=400, detail=f"Update for week {week_number} already posted")

    update = crud.create_order_update(db, {
        "order_id": order_id,
        "owner_id": current_user.id,
        "media_url": url,
        "media_type": body.media_type,
        "caption": body.caption,
        "week_number": week_number,
        "duration_seconds": body.duration_seconds,
    })

    # Notify the renter
    crud.create_notification(db, {
        "user_id": order.user_id,
        "type": "new_update",
        "title": f"New update for {tree.name}",
        "message": f"The owner posted a week {week_number} update for your tree.",
        "order_id": order_id,
    })

    return update


@router.get("/orders/{order_id}/updates", response_model=list[OrderUpdateOut])
def list_order_updates(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tree = crud.get_tree(db, order.tree_id)
    is_owner = tree and tree.owner_id == current_user.id
    is_renter = order.user_id == current_user.id

    if not is_owner and not is_renter:
        raise HTTPException(status_code=403, detail="Not authorized to view these updates")

    return crud.get_updates_for_order(db, order_id)


@router.get("/owner/pending-updates")
def get_pending_updates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """List active orders that need this week's update."""
    orders = crud.get_orders_for_owner_trees(db, current_user.id)
    active_orders = [o for o in orders if o.status == "active" and o.active_since]

    pending = []
    for order in active_orders:
        week_number = _calculate_week_number(order.active_since)
        existing = crud.get_update_for_week(db, order.id, week_number)
        if not existing:
            pending.append({
                "order_id": order.id,
                "tree_name": order.tree.name if order.tree else "Unknown",
                "tree_image": (order.tree.image_urls or [None])[0] or order.tree.image_url if order.tree else None,
                "week_number": week_number,
                "active_since": order.active_since.isoformat(),
            })

    return pending
