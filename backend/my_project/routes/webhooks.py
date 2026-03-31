import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy.orm import Session

import crud
import payment_service
from database import get_db

load_dotenv()

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")


@router.post("/razorpay", status_code=status.HTTP_200_OK)
async def razorpay_webhook(request: Request):
    """
    Handle Razorpay webhook events.
    
    Events handled:
    - payment.authorized: Payment authorized
    - payment.captured: Payment captured
    - payment.failed: Payment failed
    - refund.created: Refund processed
    """
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    
    if RAZORPAY_WEBHOOK_SECRET:
        is_valid = payment_service.verify_razorpay_webhook(
            payload=payload,
            signature=signature,
            secret=RAZORPAY_WEBHOOK_SECRET,
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    import json
    event_data = json.loads(payload.decode("utf-8"))
    
    event_type = event_data.get("event")
    payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
    
    db = next(get_db())
    try:
        if event_type == "payment.captured":
            _handle_payment_captured(db, payment_entity)
        elif event_type == "payment.failed":
            _handle_payment_failed(db, payment_entity)
        elif event_type == "refund.created":
            _handle_refund_created(db, event_data.get("payload", {}).get("refund", {}).get("entity", {}))
        
        return {"status": "ok"}
    finally:
        db.close()


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    
    Events handled:
    - payment_intent.succeeded: Payment succeeded
    - payment_intent.payment_failed: Payment failed
    - charge.refunded: Refund processed
    """
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    event = payment_service.verify_stripe_webhook(payload=payload, signature=signature)
    
    if not event:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    db = next(get_db())
    try:
        if event_type == "payment_intent.succeeded":
            _handle_stripe_payment_succeeded(db, event_data)
        elif event_type == "payment_intent.payment_failed":
            _handle_stripe_payment_failed(db, event_data)
        elif event_type == "charge.refunded":
            _handle_stripe_refund(db, event_data)
        
        return {"status": "ok"}
    finally:
        db.close()


def _handle_payment_captured(db: Session, payment_entity: dict):
    """Handle Razorpay payment.captured event."""
    payment_id = payment_entity.get("id")
    order_id_str = payment_entity.get("notes", {}).get("order_id")
    
    if not order_id_str:
        return
    
    try:
        order_id = uuid.UUID(order_id_str)
        order = crud.get_order(db, order_id)
        
        if order and order.payment_status != "completed":
            order.payment_id = payment_id
            order.payment_status = "completed"
            order.payment_method = payment_entity.get("method")
            order.payment_captured_at = datetime.utcnow()
            order.status = "confirmed"
            db.commit()
    except (ValueError, Exception):
        pass


def _handle_payment_failed(db: Session, payment_entity: dict):
    """Handle Razorpay payment.failed event."""
    order_id_str = payment_entity.get("notes", {}).get("order_id")
    
    if not order_id_str:
        return
    
    try:
        order_id = uuid.UUID(order_id_str)
        order = crud.get_order(db, order_id)
        
        if order and order.payment_status == "pending":
            order.payment_status = "failed"
            order.status = "failed"
            db.commit()
    except (ValueError, Exception):
        pass


def _handle_refund_created(db: Session, refund_entity: dict):
    """Handle Razorpay refund.created event."""
    payment_id = refund_entity.get("payment_id")
    refund_id = refund_entity.get("id")
    
    if not payment_id:
        return
    
    from sqlalchemy import select
    from models import Order
    
    result = db.execute(select(Order).where(Order.payment_id == payment_id))
    order = result.scalar_one_or_none()
    
    if order:
        order.refund_id = refund_id
        order.refunded_at = datetime.utcnow()
        order.payment_status = "refunded"
        db.commit()


def _handle_stripe_payment_succeeded(db: Session, payment_intent: dict):
    """Handle Stripe payment_intent.succeeded event."""
    payment_intent_id = payment_intent.get("id")
    order_id_str = payment_intent.get("metadata", {}).get("order_id")
    
    if not order_id_str:
        return
    
    try:
        order_id = uuid.UUID(order_id_str)
        order = crud.get_order(db, order_id)
        
        if order and order.payment_status != "completed":
            order.payment_id = payment_intent_id
            order.payment_status = "completed"
            order.payment_method = payment_intent.get("payment_method_types", [None])[0]
            order.payment_captured_at = datetime.utcnow()
            order.status = "confirmed"
            db.commit()
    except (ValueError, Exception):
        pass


def _handle_stripe_payment_failed(db: Session, payment_intent: dict):
    """Handle Stripe payment_intent.payment_failed event."""
    order_id_str = payment_intent.get("metadata", {}).get("order_id")
    
    if not order_id_str:
        return
    
    try:
        order_id = uuid.UUID(order_id_str)
        order = crud.get_order(db, order_id)
        
        if order and order.payment_status == "pending":
            order.payment_status = "failed"
            order.status = "failed"
            db.commit()
    except (ValueError, Exception):
        pass


def _handle_stripe_refund(db: Session, charge: dict):
    """Handle Stripe charge.refunded event."""
    payment_intent_id = charge.get("payment_intent")
    
    if not payment_intent_id:
        return
    
    from sqlalchemy import select
    from models import Order
    
    result = db.execute(select(Order).where(Order.payment_id == payment_intent_id))
    order = result.scalar_one_or_none()
    
    if order:
        refunds = charge.get("refunds", {}).get("data", [])
        if refunds:
            order.refund_id = refunds[0].get("id")
            order.refunded_at = datetime.utcnow()
            order.payment_status = "refunded"
            db.commit()


def _get_or_create_guest(db: Session) -> uuid.UUID:
    global _guest_id
    if _guest_id:
        return _guest_id
    guest = crud.get_user_by_email(db, "guest@rental.farm")
    if not guest:
        guest = crud.create_user(db, {
            "name": "Guest",
            "email": "guest@rental.farm",
            "password_hash": "nologin",
        })
    _guest_id = guest.id
    return _guest_id
