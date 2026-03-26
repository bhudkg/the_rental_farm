import uuid
from datetime import date

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from models import Order, Tree, User


# ── Trees ──

def get_trees(
    db: Session,
    tree_type: str | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    size: str | None = None,
    maintenance: bool | None = None,
    sort_by: str | None = None,
    search: str | None = None,
    state: str | None = None,
    city: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Tree]:
    q = db.query(Tree)
    if tree_type:
        q = q.filter(Tree.type == tree_type)
    if price_min is not None:
        q = q.filter(Tree.price_per_day >= price_min)
    if price_max is not None:
        q = q.filter(Tree.price_per_day <= price_max)
    if size:
        q = q.filter(Tree.size.ilike(f"%{size}%"))
    if maintenance is not None:
        q = q.filter(Tree.maintenance_required == maintenance)
    if search:
        q = q.filter(Tree.name.ilike(f"%{search}%"))
    if state:
        q = q.filter(Tree.state == state)
    if city:
        q = q.filter(Tree.city.ilike(f"%{city}%"))

    if sort_by == "price_low":
        q = q.order_by(Tree.price_per_day.asc())
    elif sort_by == "price_high":
        q = q.order_by(Tree.price_per_day.desc())
    elif sort_by == "name_asc":
        q = q.order_by(Tree.name.asc())
    elif sort_by == "name_desc":
        q = q.order_by(Tree.name.desc())
    else:
        q = q.order_by(Tree.created_at.desc())

    return q.offset(skip).limit(limit).all()


def get_tree(db: Session, tree_id: uuid.UUID) -> Tree | None:
    return db.query(Tree).filter(Tree.id == tree_id).first()


def create_tree(db: Session, data: dict) -> Tree:
    tree = Tree(**data)
    db.add(tree)
    db.commit()
    db.refresh(tree)
    return tree


def update_tree(db: Session, tree: Tree, data: dict) -> Tree:
    for key, val in data.items():
        if val is not None:
            setattr(tree, key, val)
    db.commit()
    db.refresh(tree)
    return tree


def delete_tree(db: Session, tree: Tree) -> None:
    db.delete(tree)
    db.commit()


# ── Availability ──

def count_overlapping_bookings(db: Session, tree_id: uuid.UUID, start: date, end: date) -> int:
    """Count bookings that overlap with the requested date range (excluding cancelled)."""
    return (
        db.query(func.count(Order.id))
        .filter(
            and_(
                Order.tree_id == tree_id,
                Order.status.notin_(["cancelled", "completed"]),
                Order.start_date <= end,
                Order.end_date >= start,
            )
        )
        .scalar()
    )


def check_availability(db: Session, tree_id: uuid.UUID, start: date, end: date) -> dict:
    tree = get_tree(db, tree_id)
    if not tree:
        return {"available": False, "available_quantity": 0, "booked_quantity": 0}
    booked = count_overlapping_bookings(db, tree_id, start, end)
    return {
        "available": tree.available_quantity > booked,
        "available_quantity": tree.available_quantity,
        "booked_quantity": booked,
    }


# ── Users ──

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, data: dict) -> User:
    user = User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Orders ──

def create_order(db: Session, data: dict) -> Order:
    order = Order(**data)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_orders_for_user(db: Session, user_id: uuid.UUID) -> list[Order]:
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()


def get_order(db: Session, order_id: uuid.UUID) -> Order | None:
    return db.query(Order).filter(Order.id == order_id).first()


def get_all_orders(db: Session) -> list[Order]:
    return db.query(Order).order_by(Order.created_at.desc()).all()


# ── Owner Trees ──

def get_trees_by_owner(db: Session, owner_id: uuid.UUID) -> list[Tree]:
    return db.query(Tree).filter(Tree.owner_id == owner_id).order_by(Tree.created_at.desc()).all()


def get_orders_for_owner_trees(db: Session, owner_id: uuid.UUID) -> list[Order]:
    """Get all orders placed on trees owned by this user."""
    return (
        db.query(Order)
        .join(Tree, Order.tree_id == Tree.id)
        .filter(Tree.owner_id == owner_id)
        .order_by(Order.created_at.desc())
        .all()
    )
