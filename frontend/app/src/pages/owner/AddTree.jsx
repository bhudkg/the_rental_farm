import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTree } from '../../services/api';

const TYPES = ['indoor', 'outdoor', 'bonsai', 'decorative'];
const SIZES = ['Small (1-2 ft)', 'Medium (3-4 ft)', 'Large (5-6 ft)', 'Extra Large (7-8 ft)'];

export default function AddTree() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'indoor',
    description: '',
    price_per_day: '',
    price_per_month: '',
    deposit: '',
    size: 'Medium (3-4 ft)',
    maintenance_required: false,
    image_url: '',
    available_quantity: 1,
  });

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        price_per_day: parseFloat(form.price_per_day),
        price_per_month: parseFloat(form.price_per_month),
        deposit: parseFloat(form.deposit || '0'),
        available_quantity: parseInt(form.available_quantity, 10),
      };
      const tree = await createTree(payload);
      navigate(`/owner/trees/${tree.id}/qr`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create tree');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/owner/trees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to my trees
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Tree</h1>
      <p className="text-gray-500 mb-8">Fill in the details to list your tree for rent.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tree Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. Fiddle Leaf Fig"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={update('type')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <select
              value={form.size}
              onChange={update('size')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Describe your tree..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Day ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price_per_day}
              onChange={update('price_per_day')}
              placeholder="15.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Month ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price_per_month}
              onChange={update('price_per_month')}
              placeholder="350.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.deposit}
              onChange={update('deposit')}
              placeholder="100.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity</label>
            <input
              type="number"
              min="1"
              value={form.available_quantity}
              onChange={update('available_quantity')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={update('image_url')}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.maintenance_required}
            onChange={update('maintenance_required')}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-gray-700">Maintenance required (we handle care for renters)</span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            to="/owner/trees"
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'List Tree'}
          </button>
        </div>
      </form>
    </div>
  );
}
