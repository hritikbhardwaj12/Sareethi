'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, CheckCircle2, UserCheck } from 'lucide-react';
import { useStoreData } from '@/context/StoreDataContext';
import { updateProfileDetails } from '@/lib/auth/actions';

interface ProfileEditFormProps {
  initialPhone: string;
  initialAddress: string;
}

export function ProfileEditForm({ initialPhone, initialAddress }: ProfileEditFormProps) {
  const { savedProfile, saveUserProfile } = useStoreData();
  const [phone, setPhone] = useState(initialPhone || savedProfile?.phone || '');
  const [address, setAddress] = useState(initialAddress || savedProfile?.address || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync with saved profile from store context or localStorage
  useEffect(() => {
    if (savedProfile) {
      if (!phone && savedProfile.phone) setPhone(savedProfile.phone);
      if (!address && savedProfile.address) setAddress(savedProfile.address);
    } else {
      try {
        const local = localStorage.getItem('sareethi_saved_profile');
        if (local) {
          const parsed = JSON.parse(local);
          if (!phone && parsed.phone) setPhone(parsed.phone);
          if (!address && parsed.address) setAddress(parsed.address);
        }
      } catch (e) {}
    }
  }, [savedProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const cleanPhone = phone.trim();
      const cleanAddress = address.trim();

      // 1. Immediately persist locally in Store Context and LocalStorage
      saveUserProfile({
        fullName: savedProfile?.fullName || 'Customer',
        phone: cleanPhone,
        address: cleanAddress,
      });

      // 2. Persist to database profile if authenticated
      try {
        await updateProfileDetails(cleanPhone, cleanAddress);
      } catch (err) {
        console.warn('Database profile sync note:', err);
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile details saved and updated successfully!</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-purple-950" />
            <div>
              <p className="font-semibold text-gray-900">Contact Number</p>
              <p className="text-gray-500">{phone || savedProfile?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-purple-950" />
            <div>
              <p className="font-semibold text-gray-900">Primary Delivery Address</p>
              <p className="text-gray-500">{address || savedProfile?.address || 'No address saved yet'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Edit Phone & Address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Contact Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210 or 09128737971"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-950 bg-white"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Primary Delivery Address</label>
        <textarea
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 123 Green Park Extension, New Delhi 110016"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-950 bg-white"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-purple-950 text-white font-bold rounded-lg hover:bg-purple-900 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
