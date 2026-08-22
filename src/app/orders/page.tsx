'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useStoreData, StoreOrder } from '@/context/StoreDataContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  ShoppingBag,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function OrdersPage() {
  const { orders } = useStoreData();
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-xs text-gray-500 mt-1">Real-time status and delivery tracking</p>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 bg-purple-950 text-white font-medium text-xs rounded-lg hover:bg-purple-900 transition-colors shadow-xs flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-gray-800">No orders placed yet</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Explore our handcrafted sarees and ethnic suit sets to place your first order.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-950 text-white font-medium text-xs rounded-lg hover:bg-purple-900"
            >
              Browse Catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const primaryItem = order.items[0];
              const isDelivered = order.status === 'DELIVERED';
              const isInTransit = order.status === 'IN_TRANSIT';

              return (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-purple-200 transition-all"
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        primaryItem?.image ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={primaryItem?.name || 'Order item'}
                      className="w-16 h-20 object-cover rounded-lg bg-gray-50 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-950 bg-purple-50 px-2 py-0.5 rounded font-mono">
                          {order.id}
                        </span>
                        {order.items.length > 1 && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                            +{order.items.length - 1} more items
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">
                        {primaryItem?.name || 'Traditional Sareethi Ensemble'}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed on {order.date} • Total: <span className="font-bold text-gray-900">₹{order.total_price.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full ${
                        isDelivered
                          ? 'text-emerald-700 bg-emerald-50'
                          : isInTransit
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-purple-700 bg-purple-50'
                      }`}
                    >
                      {isDelivered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isInTransit ? (
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      {order.status_label || order.status}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-purple-950 hover:underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                  {selectedOrder.id}
                </span>
                <h3 className="font-serif text-xl font-bold text-gray-900 mt-1">Order Details</h3>
                <p className="text-xs text-gray-500">Placed on {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Tracker */}
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-950">Status: {selectedOrder.status_label}</span>
                {selectedOrder.tracking_number && (
                  <span className="text-[10px] font-mono text-gray-500">Track: {selectedOrder.tracking_number}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                <div className="flex-1 text-center py-1 bg-emerald-100 text-emerald-800 rounded">1. Confirmed</div>
                <div className={`flex-1 text-center py-1 rounded ${selectedOrder.status !== 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                  2. Processing
                </div>
                <div className={`flex-1 text-center py-1 rounded ${selectedOrder.status === 'IN_TRANSIT' || selectedOrder.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                  3. In Transit
                </div>
                <div className={`flex-1 text-center py-1 rounded ${selectedOrder.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
                  4. Delivered
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {selectedOrder.shipping_address && (
              <div className="text-xs space-y-1 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <MapPin className="w-3.5 h-3.5 text-purple-950" /> Delivery Address
                </div>
                <p className="text-gray-800 font-medium">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
                <p className="text-gray-500">{selectedOrder.shipping_address}</p>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Ordered Items</h4>
              <div className="space-y-2.5">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center border-b border-gray-50 pb-2">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-50" />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-xs">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Paid</span>
              <span>₹{selectedOrder.total_price.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-purple-950 text-white text-xs font-bold rounded-xl hover:bg-purple-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
