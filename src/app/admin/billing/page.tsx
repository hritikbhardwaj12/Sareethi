import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { Receipt } from 'lucide-react';

export default function AdminBillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
          <Receipt className="w-12 h-12 text-purple-950 mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-gray-900">Admin Billing Panel Shell</h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Ready for Stage 7 Billing & Invoicing engine integration (Customer details, Photo capture, AI item matching, and PDF generation).
          </p>
          <div className="pt-4">
            <Link href="/admin/dashboard" className="px-5 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
