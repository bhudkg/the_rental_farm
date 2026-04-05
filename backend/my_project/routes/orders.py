import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import payment_service
from auth_utils import require_user
from database import get_db
from models import User, UserAddress
from schemas import (
    BatchOrderCreate,
    BatchPaymentVerifyRequest,
    OrderCreate,
    OrderOut,
    PaymentDetailsOut,
    PaymentVerifyRequest,
    PaymentStatusOut,
)

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _get_address_snapshot(db: Session, address_id: uuid.UUID, user_id: uuid.UUID) -> dict:
    """Fetch an address and return a dict of delivery snapshot fields."""
    address = (
        db.query(UserAddress)
        .filter(UserAddress.id == address_id, UserAddress.user_id == user_id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=400, detail="Delivery address not found")
    return {
        "delivery_full_name": address.full_name,
        "delivery_phone": address.phone,
        "delivery_address_line_1": address.address_line_1,
        "delivery_address_line_2": address.address_line_2,
        "delivery_city": address.city,
        "delivery_state": address.state,
        "delivery_pincode": address.pincode,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    tree = crud.get_tree(db, body.tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")

    if not current_user.phone:
        raise HTTPException(status_code=400, detail="Phone number required. Please update your profile.")

    delivery = _get_address_snapshot(db, body.address_id, current_user.id)
    total_price = (tree.price_per_season or 0) + 1000

    order = crud.create_order(db, {
        "user_id": current_user.id,
        "tree_id": body.tree_id,
        "total_price": total_price,
        "status": "pending",
        "payment_status": "pending",
        **delivery,
    })
    db.refresh(order, ["tree"])

    user_info = {
        "name": current_user.name,
        "email": current_user.email,
    }

    try:
        payment_details = payment_service.create_payment_order(
            order_id=order.id,
            amount=total_price,
            user_info=user_info,
        )

        order.payment_gateway = payment_details["gateway"]
        db.commit()
        db.refresh(order)

        return {
            "order": OrderOut.model_validate(order),
            "payment": PaymentDetailsOut(**payment_details),
        }
    except payment_service.PaymentServiceError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


@router.post("/batch", status_code=status.HTTP_201_CREATED)
def create_batch_orders(
    body: BatchOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    if not current_user.phone:
        raise HTTPException(status_code=400, detail="Phone number required. Please update your profile.")

    delivery = _get_address_snapshot(db, body.address_id, current_user.id)

    orders = []
    total_amount = 0.0

    for item in body.items:
        tree = crud.get_tree(db, item.tree_id)
        if not tree:
            raise HTTPException(status_code=404, detail=f"Tree {item.tree_id} not found")

        item_price = (tree.price_per_season or 0) + 1000
        total_amount += item_price

        order = crud.create_order(db, {
            "user_id": current_user.id,
            "tree_id": item.tree_id,
            "total_price": item_price,
            "status": "pending",
            "payment_status": "pending",
            **delivery,
        })
        db.refresh(order, ["tree"])
        orders.append(order)

    user_info = {"name": current_user.name, "email": current_user.email}

    try:
        batch_id = orders[0].id
        payment_details = payment_service.create_payment_order(
            order_id=batch_id,
            amount=total_amount,
            user_info=user_info,
        )

        gateway = payment_details["gateway"]
        for order in orders:
            order.payment_gateway = gateway
        db.commit()
        for order in orders:
            db.refresh(order)

        return {
            "orders": [OrderOut.model_validate(o) for o in orders],
            "payment": PaymentDetailsOut(**payment_details),
        }
    except payment_service.PaymentServiceError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


@router.post("/batch/verify")
def verify_batch_payment(
    body: BatchPaymentVerifyRequest,
    db: Session = Depends(get_db),
):
    if not body.order_ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    first_order = crud.get_order(db, body.order_ids[0])
    if not first_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if first_order.payment_status == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")

    try:
        if first_order.payment_gateway == "razorpay":
            payment_service.verify_razorpay_payment(
                payment_id=body.payment_id,
                order_id=body.order_id,
                signature=body.signature,
            )
            payment_details = payment_service.get_razorpay_payment(body.payment_id)

            for oid in body.order_ids:
                order = crud.get_order(db, oid)
                if order:
                    order.payment_id = body.payment_id
                    order.payment_status = "completed"
                    order.payment_method = payment_details.get("method")
                    order.payment_captured_at = datetime.utcnow()
                    order.status = "confirmed"
        else:
            raise HTTPException(status_code=400, detail="Unknown payment gateway")

        db.commit()

        result_orders = []
        for oid in body.order_ids:
            order = crud.get_order(db, oid)
            if order:
                db.refresh(order, ["tree"])
                result_orders.append(OrderOut.model_validate(order))

        return {"orders": result_orders}

    except payment_service.PaymentVerificationFailed as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
    except payment_service.PaymentServiceError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    return crud.get_orders_for_user(db, current_user.id)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/payment/verify", response_model=OrderOut)
def verify_payment(
    order_id: uuid.UUID,
    body: PaymentVerifyRequest,
    db: Session = Depends(get_db),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")
    
    try:
        if order.payment_gateway == "razorpay":
            payment_service.verify_razorpay_payment(
                payment_id=body.payment_id,
                order_id=body.order_id,
                signature=body.signature,
            )
            
            payment_details = payment_service.get_razorpay_payment(body.payment_id)
            
            order.payment_id = body.payment_id
            order.payment_status = "completed"
            order.payment_method = payment_details.get("method")
            order.payment_captured_at = datetime.utcnow()
            order.status = "confirmed"
            
        elif order.payment_gateway == "stripe":
            payment_intent = payment_service.get_stripe_payment_intent(body.payment_id)
            
            if payment_intent["status"] != "succeeded":
                raise payment_service.PaymentVerificationFailed("Payment not succeeded")
            
            order.payment_id = body.payment_id
            order.payment_status = "completed"
            order.payment_method = payment_intent.get("payment_method_types", [None])[0]
            order.payment_captured_at = datetime.utcnow()
            order.status = "confirmed"
        
        else:
            raise HTTPException(status_code=400, detail="Unknown payment gateway")
        
        db.commit()
        db.refresh(order, ["tree"])
        return order
        
    except payment_service.PaymentVerificationFailed as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
    except payment_service.PaymentServiceError as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")


@router.get("/{order_id}/payment-status", response_model=PaymentStatusOut)
def get_payment_status(order_id: uuid.UUID, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return PaymentStatusOut(
        payment_status=order.payment_status,
        order_status=order.status,
    )


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
    
    if order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")
    
    if order.payment_status == "completed" and order.payment_id:
        try:
            refund_result = payment_service.process_refund(
                payment_id=order.payment_id,
                gateway=order.payment_gateway,
                reason="Order cancelled by user",
            )
            order.refund_id = refund_result["refund_id"]
            order.refunded_at = datetime.utcnow()
            order.payment_status = "refunded"
        except payment_service.PaymentServiceError as e:
            raise HTTPException(status_code=500, detail=f"Refund failed: {str(e)}")
    
    order.status = "cancelled"
    db.commit()
    db.refresh(order, ["tree"])
    return order


