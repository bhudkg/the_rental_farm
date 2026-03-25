import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';

export default function BookingModal({ tree, startDate, endDate, totalPrice, deposit, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const days = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await createOrder({
        tree_id: tree.id,
        start_date: startDate,
        end_date: endDate,
      });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4">
          <img
            src={tree.image_url}
            alt={tree.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{tree.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{tree.type} &middot; {tree.size}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Rental period</span>
            <span className="font-medium">
              {startDate} &rarr; {endDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium">{days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rate</span>
            <span className="font-medium">${tree.price_per_day}/day</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between">
            <span className="text-gray-500">Rental total</span>
            <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Refundable deposit</span>
            <span className="font-medium">${deposit.toFixed(2)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-900">Total due</span>
            <span className="font-bold text-primary">${(totalPrice + deposit).toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
