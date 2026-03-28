import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import get_current_user
from database import get_db
from models import User
from schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    tree = crud.get_tree(db, body.tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")

    if body.end_date <= body.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    avail = crud.check_availability(db, body.tree_id, body.start_date, body.end_date)
    if not avail["available"]:
        raise HTTPException(status_code=409, detail="Tree not available for selected dates")

    total_price = (tree.price_per_season or 0) + 1000

    # Use authenticated user, or fall back to a guest user for MVP
    user_id = current_user.id if current_user else _get_or_create_guest(db)

    order = crud.create_order(db, {
        "user_id": user_id,
        "tree_id": body.tree_id,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "total_price": total_price,
        "deposit": tree.deposit,
        "delivery_slot": body.delivery_slot,
        "status": "pending",
    })
    db.refresh(order, ["tree"])
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    if current_user:
        return crud.get_orders_for_user(db, current_user.id)
    return crud.get_all_orders(db)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


_guest_id: uuid.UUID | None = None


def _get_or_create_guest(db: Session) -> uuid.UUID:
    global _guest_id
    if _guest_id:
        return _guest_id
    guest = crud.get_user_by_email(db, "guest@rental.farm")
    if not guest:
        guest = crud.create_user(db, {
            "name": "Guest",
            "email": "guest@rental.farm",
            "password_hash": "nologin",
        })
    _guest_id = guest.id
    return _guest_id
