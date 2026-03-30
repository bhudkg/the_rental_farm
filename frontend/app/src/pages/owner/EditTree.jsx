import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import LocationPicker from '../../components/LocationPicker';
import { fetchTree, updateTree } from '../../services/api';

const TYPES = ['mango', 'banana', 'orange', 'lemon', 'coconut', 'guava', 'grapes', 'apple', 'papaya', 'pomegranate', 'jackfruit', 'chiku'];
const SIZES = ['Small (1-2 ft)', 'Medium (3-4 ft)', 'Large (5-6 ft)', 'Extra Large (7-8 ft)'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

const MIN_IMAGES = 2;

export default function EditTree() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchTree(id)
      .then((tree) => {
        const urls = tree.image_urls?.length
          ? tree.image_urls
          : tree.image_url
            ? [tree.image_url]
            : [];
        setForm({
          name: tree.name,
          type: tree.type,
          variety: tree.variety || '',
          description: tree.description || '',
          location: tree.location || '',
          city: tree.city || '',
          state: tree.state || '',
          latitude: tree.latitude ?? '',
          longitude: tree.longitude ?? '',
          min_quantity: tree.min_quantity || 1,
          price_per_season: tree.price_per_season || '',
          season_start: tree.season_start || '',
          season_end: tree.season_end || '',
          size: tree.size || 'Medium (3-4 ft)',
          image_urls: urls,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLocationChange = useCallback(({ latitude, longitude }) => {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  }, []);

  const handleAddressChange = useCallback(({ city, state, area }) => {
    setForm((prev) => ({
      ...prev,
      city: city || prev.city,
      state: state || prev.state,
      location: area || prev.location,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.image_urls.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images of your tree.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        variety: form.variety || null,
        description: form.description || null,
        location: form.location || null,
        city: form.city || null,
        state: form.state || null,
        latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
        min_quantity: parseInt(form.min_quantity, 10),
        price_per_season: form.price_per_season ? parseFloat(form.price_per_season) : null,
        season_start: form.season_start ? parseInt(form.season_start, 10) : null,
        season_end: form.season_end ? parseInt(form.season_end, 10) : null,
        size: form.size,
        image_urls: form.image_urls,
        image_url: form.image_urls[0] || null,
      };
      await updateTree(id, payload);
      navigate('/owner/trees');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update tree');
    } finally {
      setSaving(false);
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

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Tree</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tree Images *</legend>
          <p className="text-xs text-gray-400">Upload at least {MIN_IMAGES} clear photos. The first image will be the cover.</p>
          <ImageUploader
            value={form.image_urls}
            onChange={(updater) =>
              setForm((prev) => ({
                ...prev,
                image_urls: typeof updater === 'function' ? updater(prev.image_urls) : updater,
              }))
            }
            minCount={MIN_IMAGES}
          />
        </fieldset>

        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Info</legend>

          <div>
            <label className={labelClass}>Tree Name *</label>
            <input type="text" required value={form.name} onChange={update('name')} className={inputClass} />
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
              <label className={labelClass}>Variety</label>
              <input type="text" value={form.variety} onChange={update('variety')} placeholder="e.g. Alphonso (Hapus)" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} value={form.description} onChange={update('description')} className={`${inputClass} resize-none`} />
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
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={update('city')} placeholder="Nearest city" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <select value={form.state} onChange={update('state')} className={`${inputClass} bg-white`}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <LocationPicker
            city={form.city}
            state={form.state}
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={handleLocationChange}
            onAddressChange={handleAddressChange}
          />
        </fieldset>

        {/* Season & Pricing */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season &amp; Pricing</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Season Start *</label>
              <select value={form.season_start} onChange={update('season_start')} required className={`${inputClass} bg-white`}>
                <option value="">Select month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Season End *</label>
              <select value={form.season_end} onChange={update('season_end')} required className={`${inputClass} bg-white`}>
                <option value="">Select month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          {form.season_start && form.season_end && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              Season: <span className="font-medium text-gray-700">{MONTHS[form.season_start - 1]}</span> to <span className="font-medium text-gray-700">{MONTHS[form.season_end - 1]}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price per Season (₹) *</label>
              <input type="number" step="0.01" required value={form.price_per_season} onChange={update('price_per_season')} placeholder="e.g. 4500" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price with Delivery (₹)</label>
              <div className={`${inputClass} bg-gray-50 text-gray-600`}>
                {form.price_per_season ? `₹${(parseFloat(form.price_per_season) + 1000).toLocaleString('en-IN')}` : '—'}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Season price + ₹1,000 delivery</p>
            </div>
          </div>
        </fieldset>

        {/* Details */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Yield Guarantee (kg/season)</label>
              <input type="number" min="1" value={form.min_quantity} onChange={update('min_quantity')} placeholder="e.g. 50" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <select value={form.size} onChange={update('size')} className={`${inputClass} bg-white`}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link to="/owner/trees" className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
