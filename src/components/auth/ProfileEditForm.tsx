'use client';

import { useState } from 'react';
import { Phone, MapPin } from 'lucide-react';
import { updateProfileDetails } from '@/lib/auth/actions';

interface ProfileEditFormProps {
  initialPhone: string;
  initialAddress: string;
}

export function ProfileEditForm({ initialPhone, initialAddress }: ProfileEditFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileDetails(phone, address);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-purple-950" />
            <div>
              <p className="font-semibold text-gray-900">Contact Number</p>
              <p className="text-gray-500">{phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-purple-950" />
            <div>
              <p className="font-semibold text-gray-900">Primary Delivery Address</p>
              <p className="text-gray-500">{address || 'No address saved yet'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
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
          placeholder="e.g. +91 98765 43210"
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
          className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-purple-950 text-white font-bold rounded-lg hover:bg-purple-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
