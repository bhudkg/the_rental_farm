import { useState, useEffect } from 'react';
import { fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

const EMPTY_FORM = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  pincode: '',
  is_default: false,
};

export default function AddressManager({ onAddressChange }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await fetchAddresses();
      setAddresses(data);
      onAddressChange?.(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      await load();
    } catch { /* ignore */ }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await load();
    } catch { /* ignore */ }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5';

  if (loading) {
    return <div className="text-sm text-gray-400 py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Address list */}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`relative border rounded-2xl p-4 transition-all ${
            addr.is_default ? 'border-primary/40 bg-primary/5' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{addr.label}</span>
                {addr.is_default && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Default</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">{addr.full_name}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {addr.address_line_1}
                {addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
              </p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-primary hover:underline px-2 py-1"
                >
                  Set default
                </button>
              )}
              <button
                onClick={() => handleEdit(addr)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); setError(null); }}
          className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-medium text-gray-500 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add new address
        </button>
      )}

      {/* Address form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">{editingId ? 'Edit Address' : 'New Address'}</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Home', 'Office', 'Other'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, label: l }))}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.label === l
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
              <input required value={form.full_name} onChange={update('full_name')} placeholder="Receiver's name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
              <input required value={form.phone} onChange={update('phone')} placeholder="10-digit mobile" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address Line 1 <span className="text-red-400">*</span></label>
            <input required value={form.address_line_1} onChange={update('address_line_1')} placeholder="House no, street, area" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address Line 2</label>
            <input value={form.address_line_2} onChange={update('address_line_2')} placeholder="Landmark (optional)" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City <span className="text-red-400">*</span></label>
              <input required value={form.city} onChange={update('city')} placeholder="City" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State <span className="text-red-400">*</span></label>
              <select required value={form.state} onChange={update('state')} className={`${inputClass} bg-white`}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pincode <span className="text-red-400">*</span></label>
              <input required value={form.pincode} onChange={update('pincode')} placeholder="6-digit" className={inputClass} />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setError(null); }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
