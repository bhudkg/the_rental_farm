import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';

export default function BookingModal({ tree, totalPrice, deposit, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const DELIVERY_FEE = 1000;
  const seasonPrice = Number(tree.price_per_season) || 0;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await createOrder({
        tree_id: tree.id,
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const locationParts = [tree.location, tree.city, tree.state].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-primary to-emerald-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">Confirm your order</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/70">Review the details below</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Tree info */}
          <div className="flex gap-4 items-center">
            <img
              src={tree.image_urls?.[0] || tree.image_url}
              alt={tree.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{tree.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{tree.type}{tree.variety ? ` · ${tree.variety}` : ''}</p>
              {locationParts.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{locationParts.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Season rate</span>
              <span className="font-medium">₹{seasonPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery fee</span>
              <span className="font-medium">₹{DELIVERY_FEE.toLocaleString('en-IN')}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-gray-800">
              <span className="font-medium">Rental total</span>
              <span className="font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            {Number(deposit) > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Refundable deposit</span>
                <span className="font-medium">₹{Number(deposit).toLocaleString('en-IN')}</span>
              </div>
            )}
            <hr className="border-gray-100" />
            <div className="flex justify-between pt-1">
              <span className="text-base font-bold text-gray-900">Total due</span>
              <span className="text-base font-bold text-primary">₹{(totalPrice + Number(deposit || 0)).toLocaleString('en-IN')}</span>
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

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
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
              ) : 'Confirm & Own'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
