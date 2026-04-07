import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import OwnerProfile, User
from schemas import OrderOut, OwnerProfileCreate, OwnerProfileOut, OwnerProfileUpdate, TreeOut

router = APIRouter(prefix="/api/owner", tags=["owner"])


@router.get("/trees", response_model=list[TreeOut])
def my_trees(
    db: Session = Depends(get_db),
    owner: User = Depends(require_user),
):
    return crud.get_trees_by_owner(db, owner.id)


@router.get("/orders", response_model=list[OrderOut])
def my_tree_orders(
    db: Session = Depends(get_db),
    owner: User = Depends(require_user),
):
    return crud.get_orders_for_owner_trees(db, owner.id)


@router.get("/stats")
def owner_stats(
    db: Session = Depends(get_db),
    owner: User = Depends(require_user),
):
    trees = crud.get_trees_by_owner(db, owner.id)
    orders = crud.get_orders_for_owner_trees(db, owner.id)
    total_revenue = sum(o.total_price for o in orders)
    active_orders = sum(1 for o in orders if o.status in ("pending", "confirmed", "active"))
    return {
        "total_trees": len(trees),
        "total_orders": len(orders),
        "active_orders": active_orders,
        "total_revenue": total_revenue,
    }


@router.post("/orders/{order_id}/deliver", response_model=OrderOut)
def mark_order_delivered(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    owner: User = Depends(require_user),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tree = crud.get_tree(db, order.tree_id)
    if not tree or tree.owner_id != owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized — you don't own this tree",
        )

    if order.status not in ("confirmed", "active"):
        raise HTTPException(
            status_code=400,
            detail=f"Only confirmed or active orders can be marked as delivered (current: {order.status})",
        )

    old_status = order.status
    order.status = "delivered"
    db.commit()

    crud.create_status_log(db, {
        "order_id": order_id,
        "old_status": old_status,
        "new_status": "delivered",
        "changed_by": owner.id,
        "note": "Owner marked as delivered",
    })

    crud.create_notification(db, {
        "user_id": order.user_id,
        "type": "status_change",
        "title": "Order delivered",
        "message": f"Your tree rental for {tree.name} has been marked as delivered.",
        "order_id": order_id,
    })

    db.refresh(order, ["tree"])
    return order


@router.post("/orders/{order_id}/activate", response_model=OrderOut)
def activate_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    owner: User = Depends(require_user),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tree = crud.get_tree(db, order.tree_id)
    if not tree or tree.owner_id != owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized — you don't own this tree",
        )

    if order.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail=f"Only confirmed orders can be activated (current: {order.status})",
        )

    order.status = "active"
    order.active_since = datetime.now(timezone.utc)
    db.commit()

    crud.create_status_log(db, {
        "order_id": order_id,
        "old_status": "confirmed",
        "new_status": "active",
        "changed_by": owner.id,
        "note": "Owner started the season",
    })

    crud.create_notification(db, {
        "user_id": order.user_id,
        "type": "status_change",
        "title": "Tree season started!",
        "message": f"The owner has started caring for your {tree.name}. Weekly updates will follow.",
        "order_id": order_id,
    })

    db.refresh(order, ["tree"])
    return order


# ── Owner Profile ──


@router.get("/profile", response_model=OwnerProfileOut)
def get_owner_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    profile = db.query(OwnerProfile).filter(OwnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Owner profile not found")
    return profile


@router.post("/profile", response_model=OwnerProfileOut, status_code=status.HTTP_201_CREATED)
def create_owner_profile(
    body: OwnerProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    existing = db.query(OwnerProfile).filter(OwnerProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Owner profile already exists")

    profile = OwnerProfile(user_id=current_user.id, **body.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/profile", response_model=OwnerProfileOut)
def update_owner_profile(
    body: OwnerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    profile = db.query(OwnerProfile).filter(OwnerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Owner profile not found")

    updates = body.model_dump(exclude_unset=True)
    for key, val in updates.items():
        setattr(profile, key, val)

    db.commit()
    db.refresh(profile)
    return profile
