import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth_utils import require_user
from database import get_db
from models import User, UserAddress
from schemas import AddressCreate, AddressOut, AddressUpdate

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


@router.get("", response_model=list[AddressOut])
def list_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    return (
        db.query(UserAddress)
        .filter(UserAddress.user_id == current_user.id)
        .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
        .all()
    )


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    body: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    existing = (
        db.query(UserAddress)
        .filter(UserAddress.user_id == current_user.id)
        .count()
    )
    is_first = existing == 0

    if body.is_default or is_first:
        db.query(UserAddress).filter(
            UserAddress.user_id == current_user.id,
            UserAddress.is_default.is_(True),
        ).update({"is_default": False})

    address = UserAddress(
        user_id=current_user.id,
        is_default=body.is_default or is_first,
        **body.model_dump(exclude={"is_default"}),
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: uuid.UUID,
    body: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    address = (
        db.query(UserAddress)
        .filter(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    updates = body.model_dump(exclude_unset=True)

    if updates.get("is_default"):
        db.query(UserAddress).filter(
            UserAddress.user_id == current_user.id,
            UserAddress.is_default.is_(True),
            UserAddress.id != address_id,
        ).update({"is_default": False})

    for key, val in updates.items():
        setattr(address, key, val)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    address = (
        db.query(UserAddress)
        .filter(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    was_default = address.is_default
    db.delete(address)
    db.flush()

    if was_default:
        next_addr = (
            db.query(UserAddress)
            .filter(UserAddress.user_id == current_user.id)
            .order_by(UserAddress.created_at.desc())
            .first()
        )
        if next_addr:
            next_addr.is_default = True

    db.commit()


@router.put("/{address_id}/default", response_model=AddressOut)
def set_default_address(
    address_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    address = (
        db.query(UserAddress)
        .filter(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.query(UserAddress).filter(
        UserAddress.user_id == current_user.id,
        UserAddress.is_default.is_(True),
    ).update({"is_default": False})

    address.is_default = True
    db.commit()
    db.refresh(address)
    return address
