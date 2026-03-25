import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import AvailabilityRequest, AvailabilityResponse

router = APIRouter(prefix="/api/trees", tags=["availability"])


@router.post("/{tree_id}/availability", response_model=AvailabilityResponse)
def check_availability(
    tree_id: uuid.UUID,
    body: AvailabilityRequest,
    db: Session = Depends(get_db),
):
    if body.end_date <= body.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    tree = crud.get_tree(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")

    result = crud.check_availability(db, tree_id, body.start_date, body.end_date)
    return result
