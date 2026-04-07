import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOwnerStats, fetchOwnerOrders, markOrderDelivered, activateOrder, fetchPendingUpdates } from '../../services/api';
import PostUpdateModal from '../../components/PostUpdateModal';

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
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () =>
    Promise.all([fetchOwnerStats(), fetchOwnerOrders(), fetchPendingUpdates()])
      .then(([s, o, p]) => {
        setStats(s);
        setOrders(o.slice(0, 10));
        setPendingUpdates(p);
      });

  useEffect(() => {
    loadData().finally(() => setLoading(false));
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

      {/* Pending updates alert */}
      {pendingUpdates.length > 0 && (
        <div className="mb-10 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Pending Weekly Updates</h3>
              <p className="text-sm text-amber-700">{pendingUpdates.length} order(s) need this week's update</p>
            </div>
          </div>
          <div className="space-y-2">
            {pendingUpdates.map((p) => (
              <PendingUpdateRow key={p.order_id} item={p} onPosted={loadData} />
            ))}
          </div>
        </div>
      )}

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
              <OrderRow key={order.id} order={order} onUpdate={(updatedOrder) => {
                setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o));
                loadData();
              }} pendingUpdates={pendingUpdates} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function PendingUpdateRow({ item, onPosted }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
        {item.tree_image && (
          <img src={item.tree_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.tree_name}</p>
          <p className="text-xs text-gray-500">Week {item.week_number}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shrink-0"
        >
          Post Update
        </button>
      </div>
      {showModal && (
        <PostUpdateModal
          orderId={item.order_id}
          weekNumber={item.week_number}
          treeName={item.tree_name}
          onClose={() => setShowModal(false)}
          onPosted={onPosted}
        />
      )}
    </>
  );
}


function OrderRow({ order, onUpdate, pendingUpdates }) {
  const [delivering, setDelivering] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const needsUpdate = pendingUpdates?.some((p) => p.order_id === order.id);

  const handleDeliver = async (e) => {
    e.stopPropagation();
    if (delivering) return;
    setDelivering(true);
    try {
      const updated = await markOrderDelivered(order.id);
      onUpdate(updated);
    } catch {
      // silently fail
    } finally {
      setDelivering(false);
    }
  };

  const handleActivate = async (e) => {
    e.stopPropagation();
    if (activating) return;
    setActivating(true);
    try {
      const updated = await activateOrder(order.id);
      onUpdate(updated);
    } catch {
      // silently fail
    } finally {
      setActivating(false);
    }
  };

  const pending = pendingUpdates?.find((p) => p.order_id === order.id);

  return (
    <>
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
            onClick={handleActivate}
            disabled={activating}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {activating ? 'Starting...' : 'Start Season'}
          </button>
        )}

        {order.status === 'active' && (
          <>
            {needsUpdate && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="text-xs font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shrink-0"
              >
                Post Update
              </button>
            )}
            <button
              onClick={handleDeliver}
              disabled={delivering}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {delivering ? 'Marking...' : 'Mark Delivered'}
            </button>
          </>
        )}

        <span className="font-bold text-gray-900 shrink-0">₹{order.total_price.toFixed(2)}</span>
      </div>

      {showUpdateModal && pending && (
        <PostUpdateModal
          orderId={order.id}
          weekNumber={pending.week_number}
          treeName={order.tree?.name || 'Tree'}
          onClose={() => setShowUpdateModal(false)}
          onPosted={onUpdate}
        />
      )}
    </>
  );
}
