import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  EmptyState,
  SkeletonOrderRow,
  StatusBadge,
} from '../components/ui';
import { fetchOrders } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500 mb-8">Track your current and past tree rentals.</p>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonOrderRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">Track your current and past tree rentals.</p>

      {orders.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          title="No orders yet"
          description="Once you rent a tree, you'll see weekly updates, status, and harvest delivery here."
          action={<Button to="/trees">Browse Trees</Button>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {order.tree && (
                  <img
                    src={order.tree.image_urls?.[0] || order.tree.image_url}
                    alt={order.tree.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-gray-100"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                      {order.tree?.name || 'Tree rental'}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">₹{(order.total_price ?? 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
