import { useState, useEffect } from 'react';
import { fetchAddresses, createAddress } from '../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

export default function AddressPickerCheckout({ selectedId, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    label: 'Home', full_name: '', phone: '', address_line_1: '', address_line_2: '',
    city: '', state: '', pincode: '', is_default: true,
  });

  const load = async () => {
    try {
      const data = await fetchAddresses();
      setAddresses(data);
      if (!selectedId && data.length > 0) {
        const def = data.find((a) => a.is_default) || data[0];
        onSelect(def.id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const newAddr = await createAddress(form);
      await load();
      onSelect(newAddr.id);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally { setSaving(false); }
  };

  const inputClass = 'w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all';

  if (loading) return <p className="text-sm text-gray-400 py-2">Loading addresses...</p>;

  if (addresses.length === 0 && !showForm) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">No delivery address saved. Add one to continue.</p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add delivery address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliver to</p>

      {addresses.map((addr) => (
        <label
          key={addr.id}
          className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
            selectedId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="checkout-address"
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-0.5 accent-green-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{addr.full_name}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{addr.label}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              {addr.address_line_1}, {addr.city}, {addr.state} - {addr.pincode}
            </p>
            <p className="text-xs text-gray-400">Phone: {addr.phone}</p>
          </div>
        </label>
      ))}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add new address
        </button>
      ) : (
        <form onSubmit={handleAdd} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.full_name} onChange={update('full_name')} placeholder="Full name *" className={inputClass} />
            <input required value={form.phone} onChange={update('phone')} placeholder="Phone *" className={inputClass} />
          </div>
          <input required value={form.address_line_1} onChange={update('address_line_1')} placeholder="Address line 1 *" className={inputClass} />
          <input value={form.address_line_2} onChange={update('address_line_2')} placeholder="Address line 2 (optional)" className={inputClass} />
          <div className="grid grid-cols-3 gap-3">
            <input required value={form.city} onChange={update('city')} placeholder="City *" className={inputClass} />
            <select required value={form.state} onChange={update('state')} className={`${inputClass} bg-white`}>
              <option value="">State *</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input required value={form.pincode} onChange={update('pincode')} placeholder="Pincode *" className={inputClass} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs bg-primary text-white rounded-lg font-semibold disabled:opacity-50">
              {saving ? 'Saving...' : 'Save & Use'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
