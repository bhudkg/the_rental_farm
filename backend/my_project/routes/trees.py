import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

import crud
from auth_utils import get_current_user, require_user
from database import get_db
from models import OwnerRating, Tree, TreeView, User
from schemas import TreeCreate, TreeDetailOut, TreeOut, TreeUpdate

router = APIRouter(prefix="/api/trees", tags=["trees"])


@router.get("", response_model=list[TreeOut])
def list_trees(
    type: str | None = Query(None, description="Filter by tree type"),
    variety: str | None = Query(None, description="Filter by variety"),
    price_min: float | None = Query(None, description="Min price per day"),
    price_max: float | None = Query(None, description="Max price per day"),
    size: str | None = Query(None, description="Filter by size keyword"),
    maintenance: bool | None = Query(None, description="Filter by maintenance required"),
    sort_by: str | None = Query(None, description="Sort: price_low, price_high, name_asc, name_desc"),
    search: str | None = Query(None, description="Search by tree name"),
    state: str | None = Query(None, description="Filter by state"),
    city: str | None = Query(None, description="Filter by city"),
    lat: float | None = Query(None, description="User latitude for nearby search"),
    lng: float | None = Query(None, description="User longitude for nearby search"),
    radius_km: float | None = Query(None, description="Search radius in km (default 150)"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    return crud.get_trees(
        db,
        tree_type=type,
        variety=variety,
        price_min=price_min,
        price_max=price_max,
        size=size,
        maintenance=maintenance,
        sort_by=sort_by,
        search=search,
        state=state,
        city=city,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        skip=skip,
        limit=limit,
        current_user_id=current_user.id if current_user else None,
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
    varieties = (
        db.query(Tree.variety)
        .distinct()
        .filter(Tree.variety.isnot(None), Tree.variety != "")
        .order_by(Tree.variety)
        .all()
    )
    return {
        "locations": [{"city": city, "state": state} for city, state in locations],
        "types": sorted([t[0] for t in types]),
        "varieties": sorted([v[0] for v in varieties]),
    }


@router.get("/trending", response_model=list[TreeOut])
def trending_trees(
    limit: int = Query(12, le=50),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    return crud.get_trending_trees(db, limit=limit, current_user_id=current_user.id if current_user else None)


@router.get("/{tree_id}", response_model=TreeDetailOut)
def get_tree(
    tree_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    tree = crud.get_tree(db, tree_id, load_owner=True, current_user_id=current_user.id if current_user else None)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")

    if tree.owner and tree.owner_id:
        from sqlalchemy import func as sa_func
        row = (
            db.query(sa_func.avg(OwnerRating.rating), sa_func.count(OwnerRating.id))
            .filter(OwnerRating.owner_id == tree.owner_id)
            .first()
        )
        if row and row[1] > 0:
            tree.owner.avg_rating = round(float(row[0]), 1)
            tree.owner.rating_count = row[1]
        else:
            tree.owner.avg_rating = None
            tree.owner.rating_count = 0

    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    view = TreeView(
        tree_id=tree_id,
        user_id=current_user.id if current_user else None,
        ip_hash=ip_hash,
    )
    db.add(view)
    db.commit()
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
