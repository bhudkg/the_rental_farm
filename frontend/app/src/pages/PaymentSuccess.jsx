import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrder } from '../services/api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
      return;
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

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
    return null;
  }

  const DELIVERY_FEE = 1000;
  const seasonPrice = order.tree?.price_per_season || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Your tree rental has been confirmed</p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        {/* Tree Info */}
        {order.tree && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-4 items-center">
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
                {order.tree.location && (
                  <p className="text-xs text-gray-400 mt-1">
                    {[order.tree.location, order.tree.city, order.tree.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-mono text-xs text-gray-600">{order.id}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Status</span>
            <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {order.payment_status || 'Completed'}
            </span>
          </div>

          {order.payment_method && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-700 capitalize">{order.payment_method}</span>
            </div>
          )}

          {order.payment_id && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-xs text-gray-600">{order.payment_id}</span>
            </div>
          )}

          <hr className="border-gray-200 my-4" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Season Rate</span>
            <span className="font-medium">₹{seasonPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">₹{DELIVERY_FEE.toLocaleString('en-IN')}</span>
          </div>

          <hr className="border-gray-200 my-4" />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total Paid</span>
            <span className="font-bold text-primary text-lg">₹{order.total_price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          to="/orders"
          className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-center font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          View All Orders
        </Link>
        <Link
          to="/trees"
          className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl text-center font-semibold hover:brightness-105 transition-all shadow-lg shadow-primary/20"
        >
          Rent Another Tree
        </Link>
      </div>

      {/* What's Next */}
      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            You will receive a confirmation email shortly
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            The tree owner will coordinate delivery details
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Track your order status in the Orders page
          </li>
        </ul>
      </div>
    </div>
  );
}
