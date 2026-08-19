import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

const MOCK_CUSTOMER_ORDERS = [
  {
    id: 'ORD-1028',
    date: '20 Aug 2026',
    status: 'IN_TRANSIT',
    status_label: 'In Transit (Expected Today)',
    total: 1299,
    item_name: 'Pink Pochampally Ikkat Chiffon Saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ORD-1014',
    date: '12 Aug 2026',
    status: 'DELIVERED',
    status_label: 'Delivered',
    total: 1899,
    item_name: 'Royal Blue Straight Chanderi Silk Suit Set',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

        <div className="space-y-4">
          {MOCK_CUSTOMER_ORDERS.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-4">
                <img src={order.image} alt={order.item_name} className="w-16 h-20 object-cover rounded-lg bg-gray-50" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                    {order.id}
                  </span>
                  <h2 className="text-sm font-semibold text-gray-900 mt-1">{order.item_name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Placed on {order.date} • Total: ₹{order.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  {order.status === 'IN_TRANSIT' ? <Truck className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {order.status_label}
                </span>
                <Link href={`/orders/${order.id}`} className="text-xs font-bold text-purple-950 hover:underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
