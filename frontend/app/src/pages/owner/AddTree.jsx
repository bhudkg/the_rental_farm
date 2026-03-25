import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTree } from '../../services/api';

const TYPES = ['mango', 'banana', 'orange', 'lemon', 'coconut', 'guava', 'apple', 'papaya', 'pomegranate', 'jackfruit', 'chiku'];
const SIZES = ['Small (1-2 ft)', 'Medium (3-4 ft)', 'Large (5-6 ft)', 'Extra Large (7-8 ft)'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

export default function AddTree() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'mango',
    variety: '',
    speciality: '',
    description: '',
    location: '',
    city: '',
    state: '',
    price_per_day: '',
    price_per_month: '',
    price_per_season: '',
    deposit: '',
    size: 'Medium (3-4 ft)',
    min_quantity: 1,
    available_quantity: 1,
    maintenance_required: false,
    image_url: '',
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
        price_per_season: form.price_per_season ? parseFloat(form.price_per_season) : null,
        deposit: parseFloat(form.deposit || '0'),
        min_quantity: parseInt(form.min_quantity, 10),
        available_quantity: parseInt(form.available_quantity, 10),
        variety: form.variety || null,
        speciality: form.speciality || null,
        location: form.location || null,
        city: form.city || null,
        state: form.state || null,
      };
      const tree = await createTree(payload);
      navigate(`/owner/trees/${tree.id}/qr`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create tree');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Info</legend>

          <div>
            <label className={labelClass}>Tree Name *</label>
            <input type="text" required value={form.name} onChange={update('name')} placeholder="e.g. Alphonso Mango Tree" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fruit Type *</label>
              <select value={form.type} onChange={update('type')} className={`${inputClass} bg-white`}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Variety / Breed</label>
              <input type="text" value={form.variety} onChange={update('variety')} placeholder="e.g. Alphonso (Hapus)" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Speciality</label>
            <input type="text" value={form.speciality} onChange={update('speciality')} placeholder="What makes this tree special?" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} value={form.description} onChange={update('description')} placeholder="Detailed description of your tree..." className={`${inputClass} resize-none`} />
          </div>
        </fieldset>

        {/* Location */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Local Area</label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="Farm / Area name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" required value={form.city} onChange={update('city')} placeholder="Nearest city" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <select value={form.state} onChange={update('state')} required className={`${inputClass} bg-white`}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Pricing */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pricing</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>₹ / Day *</label>
              <input type="number" step="0.01" required value={form.price_per_day} onChange={update('price_per_day')} placeholder="50" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>₹ / Month *</label>
              <input type="number" step="0.01" required value={form.price_per_month} onChange={update('price_per_month')} placeholder="1200" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>₹ / Season</label>
              <input type="number" step="0.01" value={form.price_per_season} onChange={update('price_per_season')} placeholder="4500" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deposit (₹)</label>
              <input type="number" step="0.01" value={form.deposit} onChange={update('deposit')} placeholder="500" className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Details */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Size</label>
              <select value={form.size} onChange={update('size')} className={`${inputClass} bg-white`}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Min Quantity Guarantee</label>
              <input type="number" min="1" value={form.min_quantity} onChange={update('min_quantity')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Available Quantity</label>
              <input type="number" min="1" value={form.available_quantity} onChange={update('available_quantity')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Image URL</label>
            <input type="url" value={form.image_url} onChange={update('image_url')} placeholder="https://..." className={inputClass} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.maintenance_required} onChange={update('maintenance_required')} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
            <span className="text-sm text-gray-700">We provide maintenance (care handled for renters)</span>
          </label>
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link to="/owner/trees" className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'List Tree'}
          </button>
        </div>
      </form>
    </div>
  );
}
