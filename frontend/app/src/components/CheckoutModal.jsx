import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBatchOrder, verifyBatchPayment, updatePhone } from '../services/api';
import AddressPickerCheckout from './AddressPickerCheckout';
import useStore, { DELIVERY_FEE } from '../store/useStore';
import { PLACEHOLDER_TREE_IMG } from '../constants/images';

export default function CheckoutModal({ onClose }) {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, user, setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(user?.default_address_id || null);
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const needsPhone = !user?.phone;

  useEffect(() => {
    const existing = document.querySelector('script[src*="razorpay"]');
    if (existing) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const total = getCartTotal();

  const seasonSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.tree.price_per_season) || 0),
    0,
  );
  const deliverySubtotal = cart.length * DELIVERY_FEE;

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    setSavingPhone(true);
    try {
      const updated = await updatePhone(phoneInput.trim());
      setUser(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save phone');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }
    setLoading(true);
    setError(null);

    const items = cart.map(({ tree }) => ({
      tree_id: tree.id,
    }));

    try {
      const response = await createBatchOrder({ items, address_id: selectedAddressId });
      const { orders, payment: paymentData } = response;

      if (paymentData.gateway === 'razorpay') {
        if (!razorpayLoaded || !window.Razorpay) {
          setError('Payment system not loaded. Please refresh and try again.');
          setLoading(false);
          return;
        }

        const orderIds = orders.map((o) => o.id);

        const options = {
          key: paymentData.key,
          amount: paymentData.amount * 100,
          currency: paymentData.currency,
          order_id: paymentData.order_id,
          name: 'The Rental Farm',
          description: `Rental for ${orders.length} tree${orders.length > 1 ? 's' : ''}`,
          handler: async function (razorpayResponse) {
            try {
              await verifyBatchPayment({
                order_ids: orderIds,
                payment_id: razorpayResponse.razorpay_payment_id,
                order_id: razorpayResponse.razorpay_order_id,
                signature: razorpayResponse.razorpay_signature,
              });
              clearCart();
              navigate(`/payment-success?order_ids=${orderIds.join(',')}`);
            } catch {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setError('Payment cancelled. You can try again.');
            },
          },
          theme: { color: '#10b981' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setError('Payment gateway not supported.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-primary to-emerald-600 px-6 py-5 text-white shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Checkout</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/70">
            {cart.length} {cart.length === 1 ? 'tree' : 'trees'} in your cart
          </p>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Phone check */}
          {needsPhone && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-amber-800">Phone number required</p>
              <div className="flex gap-2">
                <input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="10-digit mobile"
                  className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {savingPhone ? '...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Address picker */}
          {!needsPhone && (
            <AddressPickerCheckout
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />
          )}

          {/* Cart items */}
          <div className="space-y-3">
            {cart.map(({ tree }) => {
              const img = tree.image_urls?.[0] || tree.image_url || PLACEHOLDER_TREE_IMG;
              const price = Number(tree.price_per_season) || 0;
              const itemTotal = price + DELIVERY_FEE;

              return (
                <div key={tree.id} className="flex gap-3 items-center">
                  <img
                    src={img}
                    alt={tree.name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{tree.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{tree.type}{tree.variety ? ` · ${tree.variety}` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">₹{itemTotal.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>

          {/* Price breakdown */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Season rates</span>
              <span className="font-medium">₹{seasonSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery fees</span>
              <span className="font-medium">₹{deliverySubtotal.toLocaleString('en-IN')}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between pt-1">
              <span className="text-base font-bold text-gray-900">Total due</span>
              <span className="text-base font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-3 flex gap-3 shrink-0 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Back to Cart
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || cart.length === 0 || needsPhone || !selectedAddressId}
            className="flex-1 px-4 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl text-sm font-semibold hover:brightness-105 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
