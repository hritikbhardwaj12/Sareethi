'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData, StoreOrder } from '@/context/StoreDataContext';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Filter,
  Eye,
  X,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_phone && order.customer_phone.includes(searchQuery));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Admin Store Orders Desk</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Complete customer order fulfillment portal. Review online customer checkouts, in-store billing transactions, shipping addresses, and status telemetry.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            {orders.length} Total Orders Recorded
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-purple-950 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
            {(['ALL', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-mono font-bold text-purple-950">{ord.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{ord.customer_name}</div>
                        <div className="text-[10px] text-gray-500">{ord.customer_phone || 'No phone'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              ord.items[0]?.image ||
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                            }
                            alt=""
                            className="w-8 h-10 object-cover rounded bg-gray-50"
                          />
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1 max-w-xs">{ord.items[0]?.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {ord.items.length} {ord.items.length > 1 ? 'items' : 'item'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₹{ord.total_price.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'IN_TRANSIT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {ord.status_label || ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{ord.date}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                          className="px-3 py-1.5 bg-purple-50 text-purple-950 hover:bg-purple-950 hover:text-white rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                  {selectedOrder.id}
                </span>
                <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">{selectedOrder.customer_name}</h3>
                <p className="text-xs text-gray-500">Order Placed: {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Card */}
            <div className="p-4 bg-purple-50/70 rounded-xl space-y-2 text-xs border border-purple-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Current Status:</span>
                <span className="font-bold text-purple-950 bg-white px-2.5 py-1 rounded-md border border-purple-200">
                  {selectedOrder.status_label || selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Contact Phone:</span>
                <span className="font-bold text-gray-900">{selectedOrder.customer_phone || 'Not provided'}</span>
              </div>
              {selectedOrder.shipping_address && (
                <div className="pt-2 border-t border-purple-100">
                  <span className="text-gray-600 font-semibold block mb-0.5">Shipping / Delivery Address:</span>
                  <p className="text-gray-800 bg-white p-2.5 rounded-lg border border-purple-100">{selectedOrder.shipping_address}</p>
                </div>
              )}
            </div>

            {/* Item Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Garments in this Order ({selectedOrder.items.length}):</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs p-2.5 rounded-xl border border-gray-100 bg-gray-50 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg bg-white" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-[11px]">Quantity: {item.quantity || 1} • Unit Price: ₹{item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{((item.quantity || 1) * item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100 text-gray-900">
                <span>Total Amount Paid</span>
                <span className="text-purple-950">₹{selectedOrder.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md cursor-pointer"
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
