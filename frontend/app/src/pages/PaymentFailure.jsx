import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrder } from '../services/api';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('error') || 'Payment failed or was cancelled';
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleRetry = () => {
    if (order?.tree_id) {
      navigate(`/trees/${order.tree_id}`);
    } else {
      navigate('/trees');
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Error Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600">Your payment could not be processed</p>
      </div>

      {/* Error Details Card */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Transaction Failed</h3>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      </div>

      {/* Order Info (if available) */}
      {order?.tree && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Order Details</h2>
          <div className="flex gap-4 items-center mb-4">
            <img
              src={order.tree.image_urls?.[0] || order.tree.image_url}
              alt={order.tree.name}
              className="w-20 h-20 rounded-xl object-cover border border-gray-100"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{order.tree.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {order.tree.type}
                {order.tree.variety && ` · ${order.tree.variety}`}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Order ID</span>
              <span className="font-mono text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-gray-900">₹{order.total_price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Common Reasons */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Common reasons for payment failure
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Insufficient balance in account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Incorrect card details or CVV</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Card expired or blocked</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Payment timeout or network issue</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Daily transaction limit exceeded</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          to="/trees"
          className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-center font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Browse Trees
        </Link>
        <button
          onClick={handleRetry}
          className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl font-semibold hover:brightness-105 transition-all shadow-lg shadow-primary/20"
        >
          Try Again
        </button>
      </div>

      {/* Support Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <Link to="/support" className="text-primary font-medium hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
