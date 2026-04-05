import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import get_current_user, require_user
from database import get_db
from models import Order, OwnerRating, Tree, User
from schemas import CanRateOut, OwnerRatingCreate, OwnerRatingOut

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.post("", response_model=OwnerRatingOut, status_code=status.HTTP_201_CREATED)
def submit_rating(
    body: OwnerRatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = db.query(Order).filter(Order.id == body.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This is not your order")

    if order.status != "delivered":
        raise HTTPException(
            status_code=400,
            detail="You can only rate after the order has been delivered",
        )

    tree = db.query(Tree).filter(Tree.id == order.tree_id).first()
    if not tree or not tree.owner_id:
        raise HTTPException(status_code=400, detail="Tree or owner not found")

    owner_id = tree.owner_id

    existing = (
        db.query(OwnerRating)
        .filter(
            OwnerRating.user_id == current_user.id,
            OwnerRating.owner_id == owner_id,
            OwnerRating.order_id == body.order_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already rated this order")

    rating = OwnerRating(
        user_id=current_user.id,
        owner_id=owner_id,
        order_id=body.order_id,
        rating=body.rating,
        review=body.review,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    rating.user_name = current_user.name
    return rating


@router.get("/owner/{owner_id}", response_model=list[OwnerRatingOut])
def get_owner_ratings(
    owner_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    rows = (
        db.query(OwnerRating, User.name)
        .join(User, OwnerRating.user_id == User.id)
        .filter(OwnerRating.owner_id == owner_id)
        .order_by(OwnerRating.created_at.desc())
        .all()
    )
    results = []
    for rating, user_name in rows:
        rating.user_name = user_name
        results.append(rating)
    return results


@router.get("/can-rate/{order_id}", response_model=CanRateOut)
def can_rate(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        return CanRateOut(can_rate=False)

    if order.status != "delivered":
        return CanRateOut(can_rate=False)

    tree = db.query(Tree).filter(Tree.id == order.tree_id).first()
    if not tree or not tree.owner_id:
        return CanRateOut(can_rate=False)

    owner = db.query(User).filter(User.id == tree.owner_id).first()

    existing = (
        db.query(OwnerRating)
        .filter(
            OwnerRating.user_id == current_user.id,
            OwnerRating.owner_id == tree.owner_id,
            OwnerRating.order_id == order_id,
        )
        .first()
    )

    return CanRateOut(
        can_rate=existing is None,
        owner_id=tree.owner_id,
        owner_name=owner.name if owner else None,
        already_rated=existing is not None,
    )
