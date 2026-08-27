'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useStoreData } from '@/context/StoreDataContext';
import { updateProfileDetails } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, ArrowRight, Loader2, UserCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { placeOrder, savedProfile, saveUserProfile } = useStoreData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Autofill from saved profile & Supabase Auth
  useEffect(() => {
    if (savedProfile) {
      if (!name && savedProfile.fullName) setName(savedProfile.fullName);
      if (!email && savedProfile.email) setEmail(savedProfile.email);
      if (!phone && savedProfile.phone) setPhone(savedProfile.phone);
      if (!address && savedProfile.address) setAddress(savedProfile.address);
    }

    const loadUserEmail = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          if (!email) setEmail(user.email);
          if (!name && user.user_metadata?.full_name) {
            setName(user.user_metadata.full_name);
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    loadUserEmail();
  }, [savedProfile]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setIsSubmitting(true);
    try {
      // 1. Save profile (name, email, phone, address) for future checkouts
      saveUserProfile({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      // 2. Try updating database profile
      try {
        await updateProfileDetails(phone.trim(), address.trim());
      } catch (e) {
        // Fallback gracefully
      }

      // 3. Place order in data store with customer email
      const res = await placeOrder({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          size: it.size,
        })),
        totalAmount,
      });

      // 4. Trigger AI Worker Automated Email Receipt & Loyalty Follow-Up to Customer Email
      const customerEmail = email.trim();
      if (customerEmail && customerEmail.includes('@')) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'SEND_ORDER_INVOICE',
              payload: {
                to: customerEmail,
                customerName: name.trim() || 'Valued Customer',
                orderId: res.orderId,
                items: items.map((it) => ({
                  name: it.name,
                  price: it.price,
                  quantity: it.quantity,
                  size: it.size,
                })),
                totalPrice: totalAmount,
                shippingAddress: address.trim(),
                subject: `Order Confirmed: ${res.orderId} Bill Receipt & 5% OFF Gift from Sareethi!`,
              },
            }),
          });
        } catch (e) {
          console.error('Failed to dispatch order confirmation email:', e);
        }
      }

      setCreatedOrderId(res.orderId);
      setOrderConfirmed(true);
      clearCart();
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setIsSubmitting(false);
    }
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
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Email Address (For Order Bill & Invoice Delivery)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                    placeholder="customer@example.com"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    📧 Official order confirmation, invoice receipt, and 5% OFF discount voucher will be sent to this email address.
                  </span>
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

                <div className="flex items-center gap-2 p-2.5 bg-purple-50/60 rounded-lg border border-purple-100 text-purple-950 text-[11px]">
                  <UserCheck className="w-4 h-4 text-purple-900 shrink-0" />
                  <span>Your details will be securely remembered and saved to your profile for future orders.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 bg-purple-950 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-purple-900 disabled:opacity-50 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> PROCESSING ORDER...
                  </>
                ) : (
                  <>
                    CONFIRM ORDER (₹{totalAmount.toLocaleString()}) <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
