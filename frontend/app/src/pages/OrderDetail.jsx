import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder } from '../services/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

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

  const days = Math.ceil(
    (new Date(order.end_date) - new Date(order.start_date)) / (1000 * 60 * 60 * 24)
  );

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

      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-green-800 mb-1">Booking Confirmed!</h2>
        <p className="text-sm text-green-600">
          Your tree rental has been booked successfully.
        </p>
      </div>

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
          <span className="text-gray-500">Rental Period</span>
          <span className="font-medium">{order.start_date} &rarr; {order.end_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium">{days} days</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <span className="text-gray-500">Rental Cost</span>
          <span className="font-bold">₹{order.total_price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Refundable Deposit</span>
          <span className="font-medium">₹{order.deposit.toFixed(2)}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-base">
          <span className="font-semibold text-gray-900">Total Paid</span>
          <span className="font-bold text-primary">
            ₹{(order.total_price + order.deposit).toFixed(2)}
          </span>
        </div>
      </div>

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
