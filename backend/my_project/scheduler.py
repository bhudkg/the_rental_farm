import logging
import math
from datetime import datetime, timezone

from sqlalchemy.orm import Session

import email_service
from database import SessionLocal
from models import Notification, Order, OrderUpdate, OwnerProfile, Tree, User

logger = logging.getLogger(__name__)

PENALTY_PER_MISS = 0.5
MIN_EFFECTIVE_RATING = 1.0


def _week_number(active_since: datetime) -> int:
    now = datetime.now(timezone.utc)
    delta = now - active_since
    return max(1, math.ceil(delta.days / 7) or 1)


def _previous_week_number(active_since: datetime) -> int:
    return max(1, _week_number(active_since) - 1)


def run_sunday_check():
    """
    Runs every Sunday morning. For each active order:
    1. Remind owners who haven't posted THIS week's update yet.
    2. Penalise owners who missed LAST week's update.
    """
    db: Session = SessionLocal()
    try:
        active_orders = db.query(Order).filter(
            Order.status == "active",
            Order.active_since.isnot(None),
        ).all()

        logger.info("Sunday check: %d active orders", len(active_orders))

        for order in active_orders:
            tree = db.query(Tree).filter(Tree.id == order.tree_id).first()
            if not tree or not tree.owner_id:
                continue

            owner = db.query(User).filter(User.id == tree.owner_id).first()
            renter = db.query(User).filter(User.id == order.user_id).first()
            if not owner:
                continue

            current_week = _week_number(order.active_since)
            prev_week = _previous_week_number(order.active_since)

            # 1. Reminder for this week
            this_week_update = (
                db.query(OrderUpdate)
                .filter(OrderUpdate.order_id == order.id, OrderUpdate.week_number == current_week)
                .first()
            )
            if not this_week_update:
                db.add(Notification(
                    user_id=owner.id,
                    type="update_reminder",
                    title=f"Post your weekly update for {tree.name}",
                    message=f"Week {current_week}: Please post a photo or video update for {tree.name}.",
                    order_id=order.id,
                ))
                email_service.send_update_reminder(
                    owner.email, owner.name, tree.name, current_week,
                )

            # 2. Penalty for missed last week (only if order was active for at least 1 full week)
            if current_week > 1:
                last_week_update = (
                    db.query(OrderUpdate)
                    .filter(OrderUpdate.order_id == order.id, OrderUpdate.week_number == prev_week)
                    .first()
                )
                if not last_week_update:
                    profile = db.query(OwnerProfile).filter(OwnerProfile.user_id == owner.id).first()
                    if profile:
                        profile.penalty_score = (profile.penalty_score or 0) + PENALTY_PER_MISS
                        db.add(Notification(
                            user_id=owner.id,
                            type="rating_penalty",
                            title="Rating affected",
                            message=f"You missed last week's update for {tree.name}. A {PENALTY_PER_MISS}-point penalty was applied.",
                            order_id=order.id,
                        ))
                        email_service.send_penalty_notification(
                            owner.email, owner.name, tree.name, PENALTY_PER_MISS,
                        )
                        logger.info(
                            "Penalty applied to owner %s for order %s (week %d missed)",
                            owner.id, order.id, prev_week,
                        )

        db.commit()
        logger.info("Sunday check completed")

    except Exception:
        logger.exception("Sunday check failed")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start APScheduler with a weekly Sunday 8 AM IST cron job."""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = BackgroundScheduler()
        # Sunday at 8:00 AM IST (2:30 AM UTC)
        scheduler.add_job(
            run_sunday_check,
            CronTrigger(day_of_week="sun", hour=2, minute=30),
            id="sunday_update_check",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("Scheduler started — Sunday check at 08:00 IST")
        return scheduler
    except ImportError:
        logger.warning("APScheduler not installed — scheduler disabled. Install with: pip install apscheduler")
        return None
