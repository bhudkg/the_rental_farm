import { useState, useEffect } from 'react';
import AddressManager from '../components/AddressManager';
import useStore from '../store/useStore';
import { updatePhone, fetchOwnerProfile } from '../services/api';
import { Button, EmptyState, toast } from '../components/ui';

export default function Profile() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(true);

  useEffect(() => {
    if (user?.has_owner_profile) {
      fetchOwnerProfile()
        .then(setOwnerProfile)
        .catch(() => {})
        .finally(() => setLoadingOwner(false));
    } else {
      setLoadingOwner(false);
    }
  }, [user?.has_owner_profile]);

  const phoneError = (() => {
    if (!editingPhone) return null;
    const v = phoneInput.trim();
    if (!v) return null;
    if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number';
    return null;
  })();

  const handleSavePhone = async () => {
    const v = phoneInput.trim();
    if (!v || phoneError) return;
    setSavingPhone(true);
    try {
      const updated = await updatePhone(v);
      setUser(updated);
      setEditingPhone(false);
      toast.success('Phone number updated');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not update phone');
    } finally {
      setSavingPhone(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          title="Sign in to view your profile"
          description="Manage your account, addresses, and owner profile after signing in."
          action={<Button to="/login">Sign In</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-primary to-emerald-600 px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-sm text-white/70">Manage your account details, addresses, and owner profile</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12 space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Name</p>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-0.5">Phone</p>
            {editingPhone ? (
              <div>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                    maxLength={10}
                    aria-invalid={Boolean(phoneError) || undefined}
                    aria-describedby={phoneError ? 'phone-error' : undefined}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm transition-shadow focus:ring-4 focus:ring-primary/15 focus:border-primary outline-none placeholder:text-gray-400 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-200"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePhone}
                      loading={savingPhone}
                      disabled={Boolean(phoneError) || !phoneInput.trim()}
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => { setEditingPhone(false); setPhoneInput(user.phone || ''); }}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                {phoneError && (
                  <p id="phone-error" role="alert" className="text-xs text-red-600 mt-1.5">
                    {phoneError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-900">{user.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                <button
                  onClick={() => { setPhoneInput(user.phone || ''); setEditingPhone(true); }}
                  className="text-xs text-primary font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                >
                  {user.phone ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Delivery Addresses</h2>
          <AddressManager />
        </div>

        {/* Owner Profile */}
        {user.has_owner_profile && (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Owner Profile</h2>
              {ownerProfile?.is_verified && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>

            {loadingOwner ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : ownerProfile ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Farm Address</p>
                  <p className="text-gray-900">{ownerProfile.farm_address}, {ownerProfile.farm_city}, {ownerProfile.farm_state} - {ownerProfile.farm_pincode}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">ID Proof</p>
                    <p className="text-gray-900 capitalize">{ownerProfile.id_proof_type}: {ownerProfile.id_proof_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">UPI</p>
                    <p className="text-gray-900">{ownerProfile.upi_id || <span className="text-gray-400 italic">Not set</span>}</p>
                  </div>
                </div>
                {ownerProfile.bank_account_number && (
                  <div>
                    <p className="text-xs text-gray-400">Bank Account</p>
                    <p className="text-gray-900">{ownerProfile.bank_account_name} &middot; ****{ownerProfile.bank_account_number.slice(-4)} &middot; {ownerProfile.bank_ifsc}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
