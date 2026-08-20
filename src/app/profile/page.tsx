import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { User, LogOut, Package, MapPin, Phone } from 'lucide-react';
import { signOut, getCurrentProfile } from '@/lib/auth/actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const profileData = await getCurrentProfile();
  const user = profileData?.user;
  const profile = profileData?.profile;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Header />

        <main className="flex-1 max-w-md mx-auto w-full px-4 py-16 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-purple-100 text-purple-950 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif font-bold text-gray-900">Your Account</h1>
              <p className="text-xs text-gray-500">
                Please log in to view your account details, track orders, and manage shipping addresses.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3 px-4 bg-purple-950 text-white font-medium text-xs rounded-xl hover:bg-purple-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const email = user.email || 'Customer Profile';
  const name = user.user_metadata?.full_name || user.user_metadata?.name || profile?.full_name || email.split('@')[0];
  const initial = (name[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 bg-purple-950 text-white rounded-full flex items-center justify-center text-xl font-bold font-serif overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <p className="text-xs text-gray-500">{email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Verified Customer Profile
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-950" />
                <div>
                  <p className="font-semibold text-gray-900">Contact Number</p>
                  <p className="text-gray-500">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-950" />
                <div>
                  <p className="font-semibold text-gray-900">Primary Delivery Address</p>
                  <p className="text-gray-500">{profile?.shipping_address || 'No address saved yet'}</p>
                </div>
              </div>
            </div>

            <Link href="/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-purple-950" />
                <div>
                  <p className="font-semibold text-gray-900">Order History</p>
                  <p className="text-gray-500">View your orders</p>
                </div>
              </div>
            </Link>
          </div>

          <form action={signOut} className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="w-full py-3 bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

