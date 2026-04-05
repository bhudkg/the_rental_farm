import logging
from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models import Order, TreeTrendingScore, TreeView, Wishlist

logger = logging.getLogger(__name__)

VIEW_WEIGHT = 1.0
WISHLIST_WEIGHT = 3.0
ORDER_WEIGHT = 10.0
DECAY_RATE = 0.95
TRENDING_BADGE_THRESHOLD = 5.0


def recompute_trending_scores(db: Session) -> int:
    """Recompute trending scores for all trees. Returns count of scored trees."""
    now = datetime.now(timezone.utc)
    scores: dict[str, float] = defaultdict(float)

    views = db.query(TreeView.tree_id, TreeView.created_at).all()
    for tree_id, created_at in views:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        days = (now - created_at).total_seconds() / 86400
        scores[tree_id] += VIEW_WEIGHT * (DECAY_RATE ** days)

    wishlists = db.query(Wishlist.tree_id, Wishlist.created_at).all()
    for tree_id, created_at in wishlists:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        days = (now - created_at).total_seconds() / 86400
        scores[tree_id] += WISHLIST_WEIGHT * (DECAY_RATE ** days)

    orders = (
        db.query(Order.tree_id, Order.created_at)
        .filter(Order.payment_status.in_(["completed", "captured"]))
        .all()
    )
    for tree_id, created_at in orders:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        days = (now - created_at).total_seconds() / 86400
        scores[tree_id] += ORDER_WEIGHT * (DECAY_RATE ** days)

    db.query(TreeTrendingScore).delete()
    for tree_id, score in scores.items():
        db.add(TreeTrendingScore(tree_id=tree_id, score=round(score, 4), updated_at=now))
    db.commit()

    logger.info("Recomputed trending scores for %d trees", len(scores))
    return len(scores)
