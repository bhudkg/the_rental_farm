"""
Test script for payment integration.

Run this script to verify payment service setup and basic functionality.

Usage:
    uv run python test_payment_integration.py
"""

import os
import sys

from dotenv import load_dotenv

load_dotenv()


def test_environment_variables():
    """Test that all required environment variables are set."""
    print("=== Testing Environment Variables ===")
    
    required_vars = {
        "razorpay": ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
        "stripe": ["STRIPE_SECRET_KEY"],
    }
    
    gateway = os.getenv("PAYMENT_GATEWAY", "razorpay")
    print(f"Active Gateway: {gateway}")
    
    missing = []
    for var in required_vars.get(gateway, []):
        value = os.getenv(var)
        if not value or value.startswith("xxx"):
            missing.append(var)
            print(f"❌ {var}: Not configured")
        else:
            print(f"✓ {var}: Configured")
    
    if missing:
        print(f"\n⚠️  Missing variables: {', '.join(missing)}")
        print("Please add these to backend/.env")
        return False
    
    print("✓ All required environment variables are configured\n")
    return True


def test_gateway_initialization():
    """Test that payment gateways can be initialized."""
    print("=== Testing Gateway Initialization ===")
    
    try:
        import payment_service
        
        gateway = os.getenv("PAYMENT_GATEWAY", "razorpay")
        
        if gateway == "razorpay":
            if not payment_service.razorpay_client:
                print("❌ Razorpay client not initialized")
                return False
            print("✓ Razorpay client initialized successfully")
        
        elif gateway == "stripe":
            if not payment_service.STRIPE_SECRET_KEY:
                print("❌ Stripe not configured")
                return False
            print("✓ Stripe configured successfully")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Gateway initialization failed: {e}\n")
        return False


def test_create_payment_order():
    """Test creating a payment order."""
    print("=== Testing Payment Order Creation ===")
    
    try:
        import payment_service
        import uuid
        
        test_order_id = uuid.uuid4()
        test_amount = 10000.00
        
        result = payment_service.create_payment_order(
            order_id=test_order_id,
            amount=test_amount,
            user_info={"name": "Test User", "email": "test@example.com"},
        )
        
        print(f"Gateway: {result['gateway']}")
        print(f"Amount: ₹{result['amount']}")
        print(f"Currency: {result['currency']}")
        
        if result['gateway'] == 'razorpay':
            print(f"Order ID: {result['order_id']}")
            print(f"Key: {result['key'][:15]}...")
        elif result['gateway'] == 'stripe':
            print(f"Payment Intent ID: {result['payment_intent_id']}")
            print(f"Client Secret: {result['client_secret'][:20]}...")
        
        print("✓ Payment order created successfully\n")
        return True
        
    except payment_service.PaymentServiceError as e:
        print(f"❌ Payment order creation failed: {e}\n")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}\n")
        return False


def test_database_connection():
    """Test database connection and order table structure."""
    print("=== Testing Database Connection ===")
    
    try:
        from database import SessionLocal
        from sqlalchemy import inspect
        
        db = SessionLocal()
        
        inspector = inspect(db.bind)
        columns = [col['name'] for col in inspector.get_columns('orders')]
        
        payment_columns = [
            'payment_id',
            'payment_gateway',
            'payment_status',
            'payment_method',
            'payment_captured_at',
            'refund_id',
            'refunded_at',
        ]
        
        missing_columns = [col for col in payment_columns if col not in columns]
        
        if missing_columns:
            print(f"❌ Missing columns in orders table: {', '.join(missing_columns)}")
            print("Run: uv run alembic upgrade head")
            db.close()
            return False
        
        print("✓ Database connection successful")
        print("✓ All payment columns present in orders table\n")
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}\n")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("PAYMENT INTEGRATION TEST SUITE")
    print("="*60 + "\n")
    
    tests = [
        test_environment_variables,
        test_gateway_initialization,
        test_database_connection,
        test_create_payment_order,
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"❌ Test failed with exception: {e}\n")
            results.append(False)
    
    print("="*60)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✓ ALL TESTS PASSED ({passed}/{total})")
        print("\nPayment integration is ready for testing!")
        print("See PAYMENT_TESTING.md for detailed testing instructions.")
    else:
        print(f"⚠️  {passed}/{total} TESTS PASSED")
        print(f"\nPlease fix the failing tests before proceeding.")
    
    print("="*60 + "\n")
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
