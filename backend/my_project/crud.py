import uuid

from sqlalchemy.orm import Session

from models import Order, Tree, User


# ── Trees ──

def get_trees(
    db: Session,
    tree_type: str | None = None,
    variety: str | None = None,
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
    if variety:
        q = q.filter(Tree.variety.ilike(f"%{variety}%"))
    if price_min is not None:
        q = q.filter(Tree.price_per_season >= price_min)
    if price_max is not None:
        q = q.filter(Tree.price_per_season <= price_max)
    if size:
        q = q.filter(Tree.size.ilike(f"%{size}%"))
    if search:
        q = q.filter(
            Tree.name.ilike(f"%{search}%") | Tree.variety.ilike(f"%{search}%")
        )
    if state:
        q = q.filter(Tree.state == state)
    if city:
        q = q.filter(Tree.city.ilike(f"%{city}%"))

    if sort_by == "price_low":
        q = q.order_by(Tree.price_per_season.asc())
    elif sort_by == "price_high":
        q = q.order_by(Tree.price_per_season.desc())
    elif sort_by == "name_asc":
        q = q.order_by(Tree.name.asc())
    elif sort_by == "name_desc":
        q = q.order_by(Tree.name.desc())
    else:
        q = q.order_by(Tree.created_at.desc())

    return q.offset(skip).limit(limit).all()


def get_tree(db: Session, tree_id: uuid.UUID, load_owner: bool = False) -> Tree | None:
    from sqlalchemy.orm import joinedload
    q = db.query(Tree)
    if load_owner:
        q = q.options(joinedload(Tree.owner))
    return q.filter(Tree.id == tree_id).first()


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
    return (
        db.query(Order)
        .join(Tree, Order.tree_id == Tree.id)
        .filter(Tree.owner_id == owner_id)
        .order_by(Order.created_at.desc())
        .all()
    )
