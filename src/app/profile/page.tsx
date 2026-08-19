import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { User, LogOut, Package, MapPin, Phone } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 bg-purple-950 text-white rounded-full flex items-center justify-center text-xl font-bold font-serif">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Priya Sharma</h1>
              <p className="text-xs text-gray-500">priya.sharma@example.com</p>
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
                  <p className="text-gray-500">+91 98765 43210</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-950" />
                <div>
                  <p className="font-semibold text-gray-900">Primary Delivery Address</p>
                  <p className="text-gray-500">123 Green Park Extension, New Delhi 110016</p>
                </div>
              </div>
            </div>

            <Link href="/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-purple-950" />
                <div>
                  <p className="font-semibold text-gray-900">Order History</p>
                  <p className="text-gray-500">2 Recorded Orders</p>
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
