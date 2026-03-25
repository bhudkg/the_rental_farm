import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import User
from schemas import TreeCreate, TreeOut, TreeUpdate

router = APIRouter(prefix="/api/trees", tags=["trees"])


@router.get("", response_model=list[TreeOut])
def list_trees(
    type: str | None = Query(None, description="Filter by tree type"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return crud.get_trees(db, tree_type=type, skip=skip, limit=limit)


@router.get("/{tree_id}", response_model=TreeOut)
def get_tree(tree_id: uuid.UUID, db: Session = Depends(get_db)):
    tree = crud.get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return tree


@router.post("", response_model=TreeOut, status_code=status.HTTP_201_CREATED)
def create_tree(
    body: TreeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can list trees")
    data = body.model_dump()
    data["owner_id"] = current_user.id
    return crud.create_tree(db, data)


@router.put("/{tree_id}", response_model=TreeOut)
def update_tree(
    tree_id: uuid.UUID,
    body: TreeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    tree = crud.get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    if tree.owner_id and tree.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your tree")
    return crud.update_tree(db, tree, body.model_dump(exclude_unset=True))


@router.delete("/{tree_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tree(
    tree_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    tree = crud.get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    if tree.owner_id and tree.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your tree")
    crud.delete_tree(db, tree)
