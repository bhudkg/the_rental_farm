import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import User
from schemas import OrderOut, TreeOut

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

    if order.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail=f"Only confirmed orders can be marked as delivered (current: {order.status})",
        )

    order.status = "delivered"
    db.commit()
    db.refresh(order, ["tree"])
    return order
