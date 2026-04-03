import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
from auth_utils import require_user
from database import get_db
from models import Tree, User
from schemas import TreeCreate, TreeDetailOut, TreeOut, TreeUpdate

router = APIRouter(prefix="/api/trees", tags=["trees"])


@router.get("", response_model=list[TreeOut])
def list_trees(
    type: str | None = Query(None, description="Filter by tree type"),
    price_min: float | None = Query(None, description="Min price per day"),
    price_max: float | None = Query(None, description="Max price per day"),
    size: str | None = Query(None, description="Filter by size keyword"),
    maintenance: bool | None = Query(None, description="Filter by maintenance required"),
    sort_by: str | None = Query(None, description="Sort: price_low, price_high, name_asc, name_desc"),
    search: str | None = Query(None, description="Search by tree name"),
    state: str | None = Query(None, description="Filter by state"),
    city: str | None = Query(None, description="Filter by city"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return crud.get_trees(
        db,
        tree_type=type,
        price_min=price_min,
        price_max=price_max,
        size=size,
        maintenance=maintenance,
        sort_by=sort_by,
        search=search,
        state=state,
        city=city,
        skip=skip,
        limit=limit,
    )


@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    locations = (
        db.query(Tree.city, Tree.state)
        .distinct()
        .filter(Tree.city.isnot(None), Tree.city != "", Tree.state.isnot(None), Tree.state != "")
        .order_by(Tree.state, Tree.city)
        .all()
    )
    types = db.query(Tree.type).distinct().filter(Tree.type.isnot(None)).all()
    return {
        "locations": [{"city": city, "state": state} for city, state in locations],
        "types": sorted([t[0] for t in types]),
    }


@router.get("/{tree_id}", response_model=TreeDetailOut)
def get_tree(tree_id: uuid.UUID, db: Session = Depends(get_db)):
    tree = crud.get_tree(db, tree_id, load_owner=True)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return tree


@router.post("", response_model=TreeOut, status_code=status.HTTP_201_CREATED)
def create_tree(
    body: TreeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
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
