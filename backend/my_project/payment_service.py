import os
import uuid
from typing import Any, Literal

import razorpay
import stripe
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
PAYMENT_GATEWAY = os.getenv("PAYMENT_GATEWAY", "razorpay")
PAYMENT_CURRENCY = os.getenv("PAYMENT_CURRENCY", "INR")

razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


class PaymentServiceError(Exception):
    """Base exception for payment service errors."""
    pass


class PaymentGatewayNotConfigured(PaymentServiceError):
    """Raised when the requested payment gateway is not configured."""
    pass


class PaymentVerificationFailed(PaymentServiceError):
    """Raised when payment verification fails."""
    pass


def get_gateway() -> Literal["razorpay", "stripe"]:
    """Get the active payment gateway."""
    if PAYMENT_GATEWAY == "both":
        return "razorpay"
    return PAYMENT_GATEWAY


def create_payment_order(
    order_id: uuid.UUID,
    amount: float,
    user_info: dict[str, Any] | None = None,
    gateway: str | None = None,
) -> dict[str, Any]:
    """
    Create a payment order with the specified gateway.
    
    Args:
        order_id: The internal order ID
        amount: Amount in INR
        user_info: Optional user information (name, email, contact)
        gateway: Payment gateway to use ("razorpay" or "stripe")
    
    Returns:
        Dictionary with payment details including gateway-specific order/intent ID
    """
    gateway = gateway or get_gateway()
    
    if gateway == "razorpay":
        return _create_razorpay_order(order_id, amount, user_info)
    elif gateway == "stripe":
        return _create_stripe_payment_intent(order_id, amount, user_info)
    else:
        raise PaymentGatewayNotConfigured(f"Gateway '{gateway}' is not supported")


def _create_razorpay_order(
    order_id: uuid.UUID,
    amount: float,
    user_info: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a Razorpay order."""
    if not razorpay_client:
        raise PaymentGatewayNotConfigured("Razorpay is not configured")
    
    amount_in_paise = int(amount * 100)
    
    order_data = {
        "amount": amount_in_paise,
        "currency": PAYMENT_CURRENCY,
        "receipt": str(order_id),
        "notes": {
            "order_id": str(order_id),
        }
    }
    
    razorpay_order = razorpay_client.order.create(data=order_data)
    
    return {
        "gateway": "razorpay",
        "order_id": razorpay_order["id"],
        "amount": amount,
        "currency": PAYMENT_CURRENCY,
        "key": RAZORPAY_KEY_ID,
    }


def _create_stripe_payment_intent(
    order_id: uuid.UUID,
    amount: float,
    user_info: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a Stripe PaymentIntent."""
    if not STRIPE_SECRET_KEY:
        raise PaymentGatewayNotConfigured("Stripe is not configured")
    
    amount_in_paise = int(amount * 100)
    
    intent_data = {
        "amount": amount_in_paise,
        "currency": PAYMENT_CURRENCY.lower(),
        "metadata": {
            "order_id": str(order_id),
        },
        "automatic_payment_methods": {
            "enabled": True,
        },
    }
    
    if user_info and user_info.get("email"):
        intent_data["receipt_email"] = user_info["email"]
    
    payment_intent = stripe.PaymentIntent.create(**intent_data)
    
    return {
        "gateway": "stripe",
        "client_secret": payment_intent.client_secret,
        "payment_intent_id": payment_intent.id,
        "amount": amount,
        "currency": PAYMENT_CURRENCY,
    }


def verify_razorpay_payment(
    payment_id: str,
    order_id: str,
    signature: str,
) -> bool:
    """
    Verify Razorpay payment signature.
    
    Args:
        payment_id: Razorpay payment ID
        order_id: Razorpay order ID
        signature: Razorpay signature
    
    Returns:
        True if verification succeeds
    
    Raises:
        PaymentVerificationFailed: If verification fails
    """
    if not razorpay_client:
        raise PaymentGatewayNotConfigured("Razorpay is not configured")
    
    try:
        params_dict = {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        return True
    except razorpay.errors.SignatureVerificationError as e:
        raise PaymentVerificationFailed(f"Razorpay signature verification failed: {e}")


def verify_razorpay_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify Razorpay webhook signature.
    
    Args:
        payload: Raw webhook payload bytes
        signature: X-Razorpay-Signature header
        secret: Webhook secret
    
    Returns:
        True if verification succeeds
    """
    if not razorpay_client:
        raise PaymentGatewayNotConfigured("Razorpay is not configured")
    
    try:
        razorpay_client.utility.verify_webhook_signature(
            payload.decode("utf-8"),
            signature,
            secret,
        )
        return True
    except razorpay.errors.SignatureVerificationError:
        return False


def verify_stripe_webhook(payload: bytes, signature: str) -> dict[str, Any] | None:
    """
    Verify and parse Stripe webhook event.
    
    Args:
        payload: Raw webhook payload bytes
        signature: Stripe-Signature header
    
    Returns:
        Parsed event object if verification succeeds, None otherwise
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise PaymentGatewayNotConfigured("Stripe webhook secret is not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, STRIPE_WEBHOOK_SECRET
        )
        return event
    except (ValueError, stripe.error.SignatureVerificationError):
        return None


def get_razorpay_payment(payment_id: str) -> dict[str, Any]:
    """Fetch payment details from Razorpay."""
    if not razorpay_client:
        raise PaymentGatewayNotConfigured("Razorpay is not configured")
    
    return razorpay_client.payment.fetch(payment_id)


def get_stripe_payment_intent(payment_intent_id: str) -> dict[str, Any]:
    """Fetch PaymentIntent details from Stripe."""
    if not STRIPE_SECRET_KEY:
        raise PaymentGatewayNotConfigured("Stripe is not configured")
    
    return stripe.PaymentIntent.retrieve(payment_intent_id)


def process_refund(
    payment_id: str,
    amount: float | None = None,
    reason: str | None = None,
    gateway: str | None = None,
) -> dict[str, Any]:
    """
    Process a refund for a payment.
    
    Args:
        payment_id: Gateway payment ID
        amount: Amount to refund (None for full refund)
        reason: Reason for refund
        gateway: Payment gateway ("razorpay" or "stripe")
    
    Returns:
        Refund details including refund_id
    """
    gateway = gateway or get_gateway()
    
    if gateway == "razorpay":
        return _process_razorpay_refund(payment_id, amount, reason)
    elif gateway == "stripe":
        return _process_stripe_refund(payment_id, amount, reason)
    else:
        raise PaymentGatewayNotConfigured(f"Gateway '{gateway}' is not supported")


def _process_razorpay_refund(
    payment_id: str,
    amount: float | None = None,
    reason: str | None = None,
) -> dict[str, Any]:
    """Process a refund via Razorpay."""
    if not razorpay_client:
        raise PaymentGatewayNotConfigured("Razorpay is not configured")
    
    refund_data = {"payment_id": payment_id}
    
    if amount is not None:
        refund_data["amount"] = int(amount * 100)
    
    if reason:
        refund_data["notes"] = {"reason": reason}
    
    refund = razorpay_client.payment.refund(payment_id, refund_data)
    
    return {
        "gateway": "razorpay",
        "refund_id": refund["id"],
        "amount": refund.get("amount", 0) / 100,
        "status": refund.get("status"),
    }


def _process_stripe_refund(
    payment_intent_id: str,
    amount: float | None = None,
    reason: str | None = None,
) -> dict[str, Any]:
    """Process a refund via Stripe."""
    if not STRIPE_SECRET_KEY:
        raise PaymentGatewayNotConfigured("Stripe is not configured")
    
    refund_data = {"payment_intent": payment_intent_id}
    
    if amount is not None:
        refund_data["amount"] = int(amount * 100)
    
    if reason:
        refund_data["reason"] = reason
    
    refund = stripe.Refund.create(**refund_data)
    
    return {
        "gateway": "stripe",
        "refund_id": refund.id,
        "amount": refund.amount / 100,
        "status": refund.status,
    }


def get_payment_status(payment_id: str, gateway: str) -> str:
    """
    Get the current status of a payment.
    
    Args:
        payment_id: Gateway payment ID
        gateway: Payment gateway ("razorpay" or "stripe")
    
    Returns:
        Payment status string
    """
    if gateway == "razorpay":
        payment = get_razorpay_payment(payment_id)
        return payment.get("status", "unknown")
    elif gateway == "stripe":
        payment_intent = get_stripe_payment_intent(payment_id)
        return payment_intent.get("status", "unknown")
    else:
        raise PaymentGatewayNotConfigured(f"Gateway '{gateway}' is not supported")
