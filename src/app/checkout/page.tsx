'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderId(orderId);
    setOrderConfirmed(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        {orderConfirmed ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h1 className="font-serif text-3xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="text-sm text-gray-600">
              Thank you for shopping with Sareethi. Your order <span className="font-bold text-purple-950">{createdOrderId}</span> has been placed successfully.
            </p>
            <div className="pt-6 flex justify-center gap-4">
              <Link
                href="/orders"
                className="px-6 py-3 bg-purple-950 text-white font-medium text-xs rounded-lg hover:bg-purple-900 transition-colors shadow-md"
              >
                Track Your Order
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium text-xs rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Form */}
            <form onSubmit={handlePlaceOrder} className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Delivery Information</h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number (For Updates)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-purple-950 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-purple-900 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                CONFIRM ORDER (₹{totalAmount.toLocaleString()}) <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Order Summary */}
            <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 h-fit">
              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs border-b border-gray-50 pb-2">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded bg-gray-50" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-gray-900 mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100">
                <span>Total Payable</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
