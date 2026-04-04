import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
from auth_utils import get_current_user, require_user
from database import get_db
from models import User
from schemas import TreeOut

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.post("/{tree_id}")
def toggle_wishlist(
    tree_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    tree = crud.get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    added = crud.toggle_wishlist(db, current_user.id, tree_id)
    count = crud.get_wishlist_count(db, tree_id)
    return {"wishlisted": added, "wishlist_count": count}


@router.get("", response_model=list[TreeOut])
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    return crud.get_wishlist_for_user(db, current_user.id)
