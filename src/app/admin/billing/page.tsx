'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { createBillAction, matchProductPhotoAction, BillItemPayload, CreateBillResult } from '@/lib/actions/billing';
import { Receipt, Camera, Plus, Trash2, CheckCircle2, FileText, Sparkles, Printer, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminBillingPage() {
  const [isPending, startTransition] = useTransition();

  // Customer Details
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [customerPhone, setCustomerPhone] = useState('9876543210');

  // Items List
  const [items, setItems] = useState<BillItemPayload[]>([
    {
      product_id: 'SAR-00001',
      product_name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
      captured_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      unit_price: 1299,
      quantity: 1,
    },
    {
      product_id: 'SUIT-00001',
      product_name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
      captured_image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      unit_price: 1899,
      quantity: 1,
    },
  ]);

  // Current Item Capture State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [matchingPhoto, setMatchingPhoto] = useState(false);

  // Bill Result
  const [billResult, setBillResult] = useState<CreateBillResult | null>(null);

  const handleCaptureAndMatch = async () => {
    setMatchingPhoto(true);
    const photoUrl = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80';
    const match = await matchProductPhotoAction(photoUrl);

    setNewItemName(match.matchedProductName);
    setNewItemPrice(match.matchedPrice.toString());
    setMatchingPhoto(false);
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return;
    setItems((prev) => [
      ...prev,
      {
        product_name: newItemName,
        unit_price: parseFloat(newItemPrice) || 0,
        quantity: 1,
        captured_image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleGenerateBill = () => {
    if (items.length === 0 || !customerName || !customerPhone) return;

    startTransition(async () => {
      const result = await createBillAction({
        customer_name: customerName,
        customer_phone: customerPhone,
        items,
      });
      setBillResult(result);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Physical Store Billing Desk</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Capture physical garment photos, auto-match existing inventory, set selling prices, and issue PDF bills instantaneously.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            Real-Time PDF Generator
          </span>
        </div>

        {billResult ? (
          /* Bill Confirmation & PDF Invoice View */
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Bill Issued Successfully!</h2>
                  <p className="text-xs text-gray-500">Bill Number: <span className="font-mono font-bold text-purple-950">{billResult.billNumber}</span></p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-950 text-white font-bold text-xs rounded-lg hover:bg-purple-900 flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> PRINT PDF
              </button>
            </div>

            {/* Rendered PDF Invoice Preview */}
            <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl bg-gray-50/50 space-y-4 font-mono text-xs">
              <div className="text-center border-b border-gray-200 pb-4 space-y-1">
                <h3 className="font-serif text-xl font-bold text-purple-950 font-sans">SAREETHI FASHION RETAIL</h3>
                <p className="text-gray-500">123 Market Street, Main Galleria, New Delhi</p>
                <p className="text-gray-500">Bill No: {billResult.billNumber} • Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex justify-between text-gray-700 border-b border-gray-200 pb-2">
                <span>Customer: {customerName}</span>
                <span>Contact: {customerPhone}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold border-b border-gray-300 pb-1 text-gray-900">
                  <span className="w-1/2">Item Description</span>
                  <span className="w-1/4 text-center">Qty</span>
                  <span className="w-1/4 text-right">Price</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span className="w-1/2 line-clamp-1">{it.product_name}</span>
                    <span className="w-1/4 text-center">{it.quantity}</span>
                    <span className="w-1/4 text-right">₹{(it.unit_price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-900 pt-3 flex justify-between font-bold text-sm text-gray-900 font-sans">
                <span>TOTAL AMOUNT PAYABLE</span>
                <span>₹{billResult.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* AI Follow-Up Alert Banner */}
            {billResult.followupGenerated && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" /> AI Follow-Up Recommendation Generated
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  "{billResult.suggestedFollowupMessage}"
                </p>
                <p className="text-[10px] text-purple-600 font-semibold pt-1">Pushed to Human Approval Queue for store owner review.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => { setBillResult(null); setItems([]); }}
                className="px-6 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md"
              >
                Create Another Bill
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Billing Desk Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer Info & Capture Desk */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Customer Information</h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none"
                  />
                </div>
              </div>

              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4">2. Capture & Match Item</h2>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4 text-xs">
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={handleCaptureAndMatch}
                    disabled={matchingPhoto}
                    className="px-4 py-2.5 bg-purple-950 text-white font-semibold rounded-lg hover:bg-purple-900 flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" /> {matchingPhoto ? 'Matching AI...' : 'Capture Photo'}
                  </button>
                  <span className="text-gray-400">Simulates physical garment photo capture & AI SKU matching</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">Product Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Pink Pochampally Saree"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="1299"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-purple-900 text-white font-bold rounded-lg hover:bg-purple-800 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Item to Bill
                </button>
              </div>
            </div>

            {/* Right: Bill Items Summary & Total */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Captured Invoice Items ({items.length})</h2>
                <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs border-b border-gray-100 pb-3 items-center">
                      <img src={item.captured_image_url} alt={item.product_name} className="w-12 h-14 object-cover rounded bg-gray-50" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                        <p className="text-gray-500">Price: ₹{item.unit_price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleRemoveItem(idx)} className="text-rose-600 hover:text-rose-800 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleGenerateBill}
                  disabled={isPending || items.length === 0}
                  className="w-full py-4 bg-purple-950 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-purple-900 shadow-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? 'Generating Bill & PDF...' : 'GENERATE BILL & PDF'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
