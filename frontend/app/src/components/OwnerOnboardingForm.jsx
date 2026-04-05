import { useState } from 'react';
import { createOwnerProfile, updatePhone, fetchMe } from '../services/api';
import useStore from '../store/useStore';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir', 'Delhi',
];

export default function OwnerOnboardingForm({ onComplete }) {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    phone: user?.phone || '',
    farm_address: '',
    farm_city: '',
    farm_state: '',
    farm_pincode: '',
    id_proof_type: 'aadhaar',
    id_proof_number: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    upi_id: '',
  });

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user?.phone && form.phone) {
        await updatePhone(form.phone);
      }

      const { phone, ...profileData } = form;
      await createOwnerProfile(profileData);

      const updatedUser = await fetchMe();
      setUser(updatedUser);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create owner profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5';

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="bg-linear-to-r from-primary to-emerald-600 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Complete Your Owner Profile</h1>
          <p className="text-sm text-white/70">We need a few details before you can list trees. This is a one-time setup.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 divide-y divide-gray-100">
          {/* Phone */}
          {!user?.phone && (
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                Contact Number
              </h3>
              <div>
                <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
                <input required value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" className={inputClass} />
              </div>
            </div>
          )}

          {/* Farm Address */}
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{user?.phone ? '1' : '2'}</span>
              Farm Address
            </h3>
            <div>
              <label className={labelClass}>Farm / Plot Address <span className="text-red-400">*</span></label>
              <input required value={form.farm_address} onChange={update('farm_address')} placeholder="Farm / plot address" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>City <span className="text-red-400">*</span></label>
                <input required value={form.farm_city} onChange={update('farm_city')} placeholder="City" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State <span className="text-red-400">*</span></label>
                <select required value={form.farm_state} onChange={update('farm_state')} className={`${inputClass} bg-white`}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pincode <span className="text-red-400">*</span></label>
                <input required value={form.farm_pincode} onChange={update('farm_pincode')} placeholder="6-digit" className={inputClass} />
              </div>
            </div>
          </div>

          {/* ID Proof */}
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{user?.phone ? '2' : '3'}</span>
              Identity Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ID Proof Type <span className="text-red-400">*</span></label>
                <select required value={form.id_proof_type} onChange={update('id_proof_type')} className={`${inputClass} bg-white`}>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>ID Number <span className="text-red-400">*</span></label>
                <input required value={form.id_proof_number} onChange={update('id_proof_number')} placeholder={form.id_proof_type === 'aadhaar' ? '12-digit Aadhaar' : '10-char PAN'} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Bank / UPI */}
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{user?.phone ? '3' : '4'}</span>
              Payout Details
              <span className="text-xs font-normal text-gray-400">(optional, can add later)</span>
            </h3>
            <div>
              <label className={labelClass}>UPI ID</label>
              <input value={form.upi_id} onChange={update('upi_id')} placeholder="name@upi" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Account Holder Name</label>
                <input value={form.bank_account_name} onChange={update('bank_account_name')} placeholder="As per bank" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input value={form.bank_account_number} onChange={update('bank_account_number')} placeholder="Account number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>IFSC Code</label>
                <input value={form.bank_ifsc} onChange={update('bank_ifsc')} placeholder="e.g. SBIN0001234" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mt-5">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:brightness-105 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save & Continue to Tree Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
