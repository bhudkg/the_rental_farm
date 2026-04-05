import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOwnerStats, fetchOwnerOrders, markOrderDelivered } from '../../services/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOwnerStats(), fetchOwnerOrders()])
      .then(([s, o]) => {
        setStats(s);
        setOrders(o.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your tree listings and track rentals</p>
        </div>
        <Link
          to="/owner/trees/new"
          className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          + Add Tree
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Registered Trees</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_trees}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_orders}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Active Rental Trees</p>
            <p className="text-3xl font-bold text-primary">{stats.active_orders}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">₹{stats.total_revenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          to="/owner/trees"
          className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Registered Trees</h3>
            <p className="text-sm text-gray-500">Manage your listed trees and QR codes</p>
          </div>
        </Link>
        <Link
          to="/owner/trees/new"
          className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add New Tree</h3>
            <p className="text-sm text-gray-500">List a new tree for rent</p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Rental Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-400">No orders yet. List your first tree to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onDelivered={(updatedOrder) => {
                setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o));
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function OrderRow({ order, onDelivered }) {
  const [delivering, setDelivering] = useState(false);

  const handleDeliver = async (e) => {
    e.stopPropagation();
    if (delivering) return;
    setDelivering(true);
    try {
      const updated = await markOrderDelivered(order.id);
      onDelivered(updated);
    } catch {
      // silently fail — button stays
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl">
      {order.tree && (
        <img
          src={order.tree.image_urls?.[0] || order.tree.image_url}
          alt={order.tree.name}
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{order.tree?.name}</p>
        <p className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>
      <span
        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
          STATUS_STYLES[order.status] || 'bg-gray-100'
        }`}
      >
        {order.status}
      </span>
      {order.status === 'confirmed' && (
        <button
          onClick={handleDeliver}
          disabled={delivering}
          className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {delivering ? 'Marking...' : 'Mark Delivered'}
        </button>
      )}
      <span className="font-bold text-gray-900 shrink-0">₹{order.total_price.toFixed(2)}</span>
    </div>
  );
}
