import math
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Notification, Order, OrderStatusLog, OrderUpdate, OwnerRating, Tree, TreeTrendingScore, User, Wishlist

_EARTH_RADIUS_KM = 6371.0


def _haversine_expr(lat: float, lng: float):
    """SQLAlchemy expression returning distance in km from (lat, lng) to tree's coords."""
    dlat = func.radians(Tree.latitude - lat)
    dlng = func.radians(Tree.longitude - lng)
    a = (
        func.sin(dlat / 2) * func.sin(dlat / 2)
        + func.cos(func.radians(lat))
        * func.cos(func.radians(Tree.latitude))
        * func.sin(dlng / 2)
        * func.sin(dlng / 2)
    )
    return _EARTH_RADIUS_KM * 2 * func.atan2(func.sqrt(a), func.sqrt(1 - a))


def _bbox_bounds(lat: float, lng: float, radius_km: float):
    """Rough bounding-box for a fast pre-filter before the expensive Haversine."""
    delta_lat = radius_km / 111.0
    delta_lng = radius_km / (111.0 * math.cos(math.radians(lat)))
    return lat - delta_lat, lat + delta_lat, lng - delta_lng, lng + delta_lng


def _annotate_trending(trees: list[Tree], db: Session):
    """Attach trending_score to each tree in-place."""
    if not trees:
        return
    tree_ids = [t.id for t in trees]
    rows = (
        db.query(TreeTrendingScore.tree_id, TreeTrendingScore.score)
        .filter(TreeTrendingScore.tree_id.in_(tree_ids))
        .all()
    )
    score_map = {tid: score for tid, score in rows}
    for tree in trees:
        tree.trending_score = score_map.get(tree.id, 0.0)


def _annotate_wishlist(trees: list[Tree], db: Session, current_user_id: uuid.UUID | None = None):
    """Attach wishlist_count and is_wishlisted to each tree in-place."""
    if not trees:
        return
    tree_ids = [t.id for t in trees]
    counts = (
        db.query(Wishlist.tree_id, func.count(Wishlist.id))
        .filter(Wishlist.tree_id.in_(tree_ids))
        .group_by(Wishlist.tree_id)
        .all()
    )
    count_map = {tid: cnt for tid, cnt in counts}

    wishlisted_set = set()
    if current_user_id:
        rows = (
            db.query(Wishlist.tree_id)
            .filter(Wishlist.user_id == current_user_id, Wishlist.tree_id.in_(tree_ids))
            .all()
        )
        wishlisted_set = {r[0] for r in rows}

    for tree in trees:
        tree.wishlist_count = count_map.get(tree.id, 0)
        tree.is_wishlisted = tree.id in wishlisted_set


def _annotate_owner_rating(trees: list[Tree], db: Session):
    """Attach owner_avg_rating and owner_rating_count to each tree in-place."""
    if not trees:
        return
    owner_ids = list({t.owner_id for t in trees if t.owner_id is not None})
    if not owner_ids:
        for tree in trees:
            tree.owner_avg_rating = None
            tree.owner_rating_count = 0
        return
    rows = (
        db.query(
            OwnerRating.owner_id,
            func.avg(OwnerRating.rating),
            func.count(OwnerRating.id),
        )
        .filter(OwnerRating.owner_id.in_(owner_ids))
        .group_by(OwnerRating.owner_id)
        .all()
    )
    rating_map = {oid: (round(float(avg), 1), cnt) for oid, avg, cnt in rows}
    for tree in trees:
        if tree.owner_id and tree.owner_id in rating_map:
            tree.owner_avg_rating, tree.owner_rating_count = rating_map[tree.owner_id]
        else:
            tree.owner_avg_rating = None
            tree.owner_rating_count = 0


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
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user_id: uuid.UUID | None = None,
) -> list[Tree]:
    nearby_mode = lat is not None and lng is not None
    effective_radius = radius_km if radius_km else 150.0

    if nearby_mode:
        dist_expr = _haversine_expr(lat, lng).label("distance_km")
        q = db.query(Tree, dist_expr)

        q = q.filter(Tree.latitude.isnot(None), Tree.longitude.isnot(None))
        min_lat, max_lat, min_lng, max_lng = _bbox_bounds(lat, lng, effective_radius)
        q = q.filter(
            Tree.latitude.between(min_lat, max_lat),
            Tree.longitude.between(min_lng, max_lng),
        )
    else:
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
    if not nearby_mode:
        if state:
            q = q.filter(Tree.state == state)
        if city:
            q = q.filter(Tree.city.ilike(f"%{city}%"))

    if nearby_mode:
        dist_filter = _haversine_expr(lat, lng)
        q = q.filter(dist_filter <= effective_radius)

        if sort_by == "trending":
            q = q.outerjoin(TreeTrendingScore, Tree.id == TreeTrendingScore.tree_id)
            q = q.order_by(func.coalesce(TreeTrendingScore.score, 0).desc())
        elif sort_by == "price_low":
            q = q.order_by(Tree.price_per_season.asc())
        elif sort_by == "price_high":
            q = q.order_by(Tree.price_per_season.desc())
        elif sort_by == "name_asc":
            q = q.order_by(Tree.name.asc())
        elif sort_by == "name_desc":
            q = q.order_by(Tree.name.desc())
        else:
            q = q.order_by(dist_expr.asc())

        rows = q.offset(skip).limit(limit).all()
        trees = []
        for tree, distance in rows:
            tree.distance_km = round(distance, 1)
            trees.append(tree)
        _annotate_wishlist(trees, db, current_user_id)
        _annotate_trending(trees, db)
        _annotate_owner_rating(trees, db)
        return trees

    if sort_by == "trending":
        q = q.outerjoin(TreeTrendingScore, Tree.id == TreeTrendingScore.tree_id)
        q = q.order_by(func.coalesce(TreeTrendingScore.score, 0).desc())
    elif sort_by == "price_low":
        q = q.order_by(Tree.price_per_season.asc())
    elif sort_by == "price_high":
        q = q.order_by(Tree.price_per_season.desc())
    elif sort_by == "name_asc":
        q = q.order_by(Tree.name.asc())
    elif sort_by == "name_desc":
        q = q.order_by(Tree.name.desc())
    else:
        q = q.order_by(Tree.created_at.desc())

    trees = q.offset(skip).limit(limit).all()
    _annotate_wishlist(trees, db, current_user_id)
    _annotate_trending(trees, db)
    _annotate_owner_rating(trees, db)
    return trees


def get_tree(db: Session, tree_id: uuid.UUID, load_owner: bool = False, current_user_id: uuid.UUID | None = None) -> Tree | None:
    from sqlalchemy.orm import joinedload
    q = db.query(Tree)
    if load_owner:
        q = q.options(joinedload(Tree.owner))
    tree = q.filter(Tree.id == tree_id).first()
    if tree:
        _annotate_wishlist([tree], db, current_user_id)
        _annotate_trending([tree], db)
        _annotate_owner_rating([tree], db)
    return tree


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


# ── Wishlist ──

def toggle_wishlist(db: Session, user_id: uuid.UUID, tree_id: uuid.UUID) -> bool:
    """Toggle wishlist status. Returns True if added, False if removed."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.tree_id == tree_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(Wishlist(user_id=user_id, tree_id=tree_id))
    db.commit()
    return True


def get_wishlist_for_user(db: Session, user_id: uuid.UUID) -> list[Tree]:
    tree_ids = (
        db.query(Wishlist.tree_id)
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.created_at.desc())
        .subquery()
    )
    trees = db.query(Tree).filter(Tree.id.in_(tree_ids)).all()
    _annotate_wishlist(trees, db, user_id)
    return trees


def get_wishlist_count(db: Session, tree_id: uuid.UUID) -> int:
    return db.query(func.count(Wishlist.id)).filter(Wishlist.tree_id == tree_id).scalar() or 0


# ── Order Updates ──

def create_order_update(db: Session, data: dict) -> OrderUpdate:
    update = OrderUpdate(**data)
    db.add(update)
    db.commit()
    db.refresh(update)
    return update


def get_updates_for_order(db: Session, order_id: uuid.UUID) -> list[OrderUpdate]:
    return (
        db.query(OrderUpdate)
        .filter(OrderUpdate.order_id == order_id)
        .order_by(OrderUpdate.week_number.desc())
        .all()
    )


def get_update_for_week(db: Session, order_id: uuid.UUID, week_number: int) -> OrderUpdate | None:
    return (
        db.query(OrderUpdate)
        .filter(OrderUpdate.order_id == order_id, OrderUpdate.week_number == week_number)
        .first()
    )


# ── Notifications ──

def create_notification(db: Session, data: dict) -> Notification:
    notif = Notification(**data)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_notifications_for_user(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_unread_count(db: Session, user_id: uuid.UUID) -> int:
    return (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .scalar() or 0
    )


def mark_notification_read(db: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification | None:
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif


def mark_all_read(db: Session, user_id: uuid.UUID) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return count


# ── Order Status Log ──

def create_status_log(db: Session, data: dict) -> OrderStatusLog:
    log = OrderStatusLog(**data)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_status_logs_for_order(db: Session, order_id: uuid.UUID) -> list[OrderStatusLog]:
    return (
        db.query(OrderStatusLog)
        .filter(OrderStatusLog.order_id == order_id)
        .order_by(OrderStatusLog.created_at.asc())
        .all()
    )


# ── Trending ──

def get_trending_trees(db: Session, limit: int = 12, current_user_id: uuid.UUID | None = None) -> list[Tree]:
    rows = (
        db.query(Tree, TreeTrendingScore.score)
        .join(TreeTrendingScore, Tree.id == TreeTrendingScore.tree_id)
        .order_by(TreeTrendingScore.score.desc())
        .limit(limit)
        .all()
    )
    trees = []
    for tree, score in rows:
        tree.trending_score = round(score, 4)
        trees.append(tree)
    _annotate_wishlist(trees, db, current_user_id)
    _annotate_owner_rating(trees, db)
    return trees
