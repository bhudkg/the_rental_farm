import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder, checkCanRate, submitRating, confirmReceipt } from '../services/api';
import StatusTracker from '../components/StatusTracker';
import OrderTimeline from '../components/OrderTimeline';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const loadOrder = () => fetchOrder(id).then(setOrder);

  useEffect(() => {
    loadOrder().finally(() => setLoading(false));
  }, [id]);

  const handleConfirmReceipt = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      const updated = await confirmReceipt(id);
      setOrder(updated);
    } catch {
      // stay on current state
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Order not found</p>
        <Link to="/orders" className="text-primary font-medium mt-4 inline-block">
          &larr; Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to orders
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${
            STATUS_STYLES[order.status] || 'bg-gray-100'
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Status tracker */}
      <StatusTracker orderId={order.id} currentStatus={order.status} createdAt={order.created_at} />

      {/* Tree info */}
      {order.tree && (
        <div className="flex gap-4 mb-8">
          <img
            src={order.tree.image_urls?.[0] || order.tree.image_url}
            alt={order.tree.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{order.tree.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{order.tree.type} &middot; {order.tree.size}</p>
          </div>
        </div>
      )}

      {/* Details card */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID</span>
          <span className="font-mono text-xs text-gray-600">{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Placed on</span>
          <span className="font-medium">
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-base">
          <span className="font-semibold text-gray-900">Total Paid</span>
          <span className="font-bold text-primary">
            ₹{(order.total_price ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Confirm receipt button for renter */}
      {order.status === 'delivered' && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900">Order delivered</p>
            <p className="text-sm text-amber-700">Please confirm that you have received everything.</p>
          </div>
          <button
            onClick={handleConfirmReceipt}
            disabled={confirming}
            className="px-5 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {confirming ? 'Confirming...' : 'Confirm Receipt'}
          </button>
        </div>
      )}

      {/* Weekly updates timeline */}
      <OrderTimeline orderId={order.id} status={order.status} />

      {(order.status === 'delivered' || order.status === 'completed') && (
        <RatingSection orderId={order.id} />
      )}

      <div className="mt-8 text-center">
        <Link
          to="/trees"
          className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          Rent Another Tree
        </Link>
      </div>
    </div>
  );
}


function RatingSection({ orderId }) {
  const [rateInfo, setRateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkCanRate(orderId)
      .then(setRateInfo)
      .catch(() => setRateInfo(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRating({
        order_id: orderId,
        rating: selectedRating,
        review: review.trim() || null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!rateInfo) return null;

  if (rateInfo.already_rated) {
    return (
      <div className="mt-8 bg-gray-50 rounded-2xl p-6 text-center">
        <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <p className="text-sm text-gray-500">You have already rated this order. Thank you!</p>
      </div>
    );
  }

  if (!rateInfo.can_rate) return null;

  if (submitted) {
    return (
      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <svg className="w-10 h-10 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-emerald-800">Thank you for your rating!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-50 rounded-2xl p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Rate {rateInfo.owner_name || 'the owner'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">How was your experience with this tree rental?</p>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelectedRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || selectedRating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {selectedRating > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-600">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating]}
          </span>
        )}
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write a review (optional)"
        rows={3}
        maxLength={1000}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none mb-4"
      />

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedRating === 0 || submitting}
        className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}
