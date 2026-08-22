'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData } from '@/context/StoreDataContext';
import { CameraCaptureModal } from '@/components/admin/CameraCaptureModal';
import { executeEndToEndBillingCascadeAction, BillItemPayload, CreateBillResult } from '@/lib/actions/billing';
import {
  Receipt,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  ArrowRight,
  X,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminBillingPage() {
  const { createBill } = useStoreData();
  const [isPending, startTransition] = useTransition();

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Captured Items List (Empty by default)
  const [items, setItems] = useState<BillItemPayload[]>([]);

  // Current Item Capture State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  // Bill Result
  const [billResult, setBillResult] = useState<CreateBillResult | null>(null);

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      alert('Please provide a product description and price.');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        product_id: `ITEM-${Math.floor(1000 + Math.random() * 9000)}`,
        product_name: newItemName.trim(),
        unit_price: parseFloat(newItemPrice) || 0,
        quantity: 1,
        captured_image_url:
          newItemImage ||
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    // Reset item capture inputs
    setNewItemName('');
    setNewItemPrice('');
    setNewItemImage(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const getWhatsAppLink = () => {
    if (!customerPhone || !billResult) return '#';
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsText = items
      .map(
        (it) =>
          `• ${it.product_name} (Qty: ${it.quantity}) - ₹${(
            it.unit_price * it.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const invoiceUrl = `https://sareethi.vercel.app/invoice/${encodeURIComponent(billResult.billNumber)}`;

    const message =
      `*SAREETHI FASHION RETAIL - DIGITAL INVOICE*\n\n` +
      `Hello *${customerName}*,\n` +
      `Thank you for shopping with us! Here is your purchase receipt:\n\n` +
      `📄 *Bill No:* ${billResult.billNumber}\n` +
      `📦 *Order ID:* ${billResult.orderId}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}\n\n` +
      `*Items Purchased:*\n` +
      `${itemsText}\n\n` +
      `💰 *Total Amount Paid:* ₹${totalAmount.toLocaleString()}\n` +
      `✅ *Payment Status:* Confirmed\n\n` +
      `📄 *Official Digital & PDF Invoice:*\n` +
      `${invoiceUrl}\n\n` +
      `We hope you love your purchase! Visit us again soon at Sareethi.\n` +
      `_Sareethi Fashion Retail - Deoghar & Online_`;

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleGenerateBill = () => {
    if (items.length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter Customer Name and Contact Phone Number.');
      return;
    }

    startTransition(async () => {
      // 1. Update persistent local store state & orders database
      const result = await createBill({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items,
      });

      // 2. Automated AI Worker WhatsApp Dispatch
      try {
        fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SEND_INVOICE',
            payload: {
              to: customerPhone.trim(),
              customerName: customerName.trim(),
              billNumber: result.billNumber,
              orderId: result.orderId,
              totalAmount,
              items,
              invoiceUrl: `https://sareethi.vercel.app/invoice/${encodeURIComponent(result.billNumber)}`,
            },
          }),
        }).catch(() => {});
      } catch (e) {}

      // 3. Call server action for backend cascade
      try {
        await executeEndToEndBillingCascadeAction({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          items,
        });
      } catch (err) {
        // Safe fallback
      }

      setBillResult(result);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans print:bg-white print:min-h-0">
      {/* Admin Header (Hidden on Print) */}
      <div className="print:hidden">
        <AdminHeader />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none">
        {/* Header (Hidden on Print) */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Physical Store Billing Desk</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Create instant digital bills, save order records, and send the official receipt directly to the customer's WhatsApp.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Direct Delivery
          </span>
        </div>

        {billResult ? (
          /* Bill Confirmation Screen with WhatsApp & Clean Print */
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6 max-w-2xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none">
            {/* Top confirmation banner (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Bill Generated Successfully!</h2>
                  <p className="text-xs text-gray-500">
                    Bill No: <span className="font-mono font-bold text-purple-950">{billResult.billNumber}</span> • Saved to Orders
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp Send & Print (Hidden on Print) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 print:hidden">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white" /> Send Bill via WhatsApp
              </a>

              <button
                onClick={() => window.print()}
                className="py-3.5 px-4 bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>

            {/* Official Digital Tax Invoice Box (Printed cleanly) */}
            <div className="border-2 border-dashed border-gray-300 print:border-solid print:border-gray-900 p-6 sm:p-8 rounded-2xl bg-gray-50/50 print:bg-white space-y-5 text-xs">
              {/* Receipt Header */}
              <div className="text-center border-b border-gray-300 pb-4 space-y-1">
                <h3 className="font-serif text-2xl font-bold text-purple-950">SAREETHI FASHION RETAIL</h3>
                <p className="text-gray-500">Main Galleria, Deoghar, Jharkhand • GST: 20ABCDE1234F1Z5</p>
                <p className="text-gray-600 font-mono text-[11px]">
                  Bill No: <strong>{billResult.billNumber}</strong> • Date: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Customer Info */}
              <div className="flex justify-between text-gray-700 border-b border-gray-200 pb-3">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">Customer:</span>
                  <strong className="text-gray-900 text-sm">{customerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">Contact Number:</span>
                  <strong className="text-gray-900 text-sm">{customerPhone}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold border-b-2 border-gray-900 pb-1.5 text-gray-900 text-[11px] uppercase tracking-wider">
                  <span className="w-1/2">Item Description</span>
                  <span className="w-1/4 text-center">Qty</span>
                  <span className="w-1/4 text-right">Price</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800 py-1 border-b border-gray-100 last:border-none">
                    <span className="w-1/2 font-semibold line-clamp-1">{it.product_name}</span>
                    <span className="w-1/4 text-center">{it.quantity}</span>
                    <span className="w-1/4 text-right font-bold">₹{(it.unit_price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="border-t-2 border-gray-900 pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>TOTAL AMOUNT PAID</span>
                <span className="text-purple-950 font-bold text-xl">₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4 border-t border-gray-200 text-gray-500 text-[11px] space-y-0.5">
                <p className="font-semibold text-gray-800">Thank you for shopping at Sareethi!</p>
                <p className="text-[10px] text-gray-400">Digital Copy available at: https://sareethi.vercel.app/invoice/{billResult.billNumber}</p>
              </div>
            </div>

            {/* Navigation Options (Hidden on Print) */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs print:hidden">
              <Link href="/admin/orders" className="font-bold text-purple-950 hover:underline flex items-center gap-1">
                View in Admin Orders Desk <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setBillResult(null);
                  setItems([]);
                  setCustomerName('');
                  setCustomerPhone('');
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                + Create Another Bill
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Billing Desk Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Capture Desk */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Customer Information</h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hritik Bhardwaj"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9128737971"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-950 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4">2. Capture & Add Garment</h2>

              <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4 text-xs">
                {/* Photo Attachment Section */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCameraModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-950 text-white font-semibold rounded-xl hover:bg-purple-900 flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    {newItemImage ? 'Retake / Change Photo' : 'Open Live Camera / Snap Photo'}
                  </button>
                  <span className="text-gray-500 text-[11px]">Attach photo of garment</span>
                </div>

                {/* Attached Image Thumbnail */}
                {newItemImage && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200">
                    <img src={newItemImage} alt="Captured" className="w-14 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <span className="font-bold text-gray-800 text-xs block">Photo Attached</span>
                      <span className="text-[10px] text-gray-400">Ready to add to bill</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewItemImage(null)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Product Description and Price Inputs */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">Product Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mustard Printed Silk Saree"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="1299"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 bg-purple-950 text-white font-bold rounded-xl hover:bg-purple-900 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-400" /> Add Item to Bill
                </button>
              </div>
            </div>

            {/* Right: Bill Summary */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Captured Invoice Items ({items.length})</h2>
                <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-xs">No items added yet.</p>
                      <p className="text-[10px] text-gray-400">Snap a photo or enter item description & price, then click "Add Item to Bill".</p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-xs border-b border-gray-100 pb-3 items-center">
                        <img src={item.captured_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'} alt={item.product_name} className="w-12 h-14 object-cover rounded-lg bg-gray-50" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                          <p className="text-gray-500">Price: ₹{item.unit_price.toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-purple-950 font-bold">₹{totalAmount.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleGenerateBill}
                  disabled={isPending || items.length === 0}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  {isPending ? 'Generating Bill...' : 'GENERATE BILL & SEND VIA WHATSAPP'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Camera Live Modal */}
      {cameraModalOpen && (
        <CameraCaptureModal
          onClose={() => setCameraModalOpen(false)}
          onSelectImage={(imageUrl) => {
            setNewItemImage(imageUrl);
            setCameraModalOpen(false);
          }}
        />
      )}

      {/* Footer (Hidden on Print) */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
