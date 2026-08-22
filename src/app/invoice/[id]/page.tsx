'use client';

import { useParams } from 'next/navigation';
import { useStoreData } from '@/context/StoreDataContext';
import { Printer, Download, ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const billId = typeof params?.id === 'string' ? decodeURIComponent(params.id) : '';
  const { bills, orders } = useStoreData();

  // Find matching bill
  const bill = bills.find((b) => b.billNumber === billId || b.orderId === billId);
  const matchingOrder = orders.find((o) => o.bill_number === billId || o.id === billId);

  const customerName = bill?.customerName || matchingOrder?.customer_name || 'Valued Customer';
  const customerPhone = bill?.customerPhone || matchingOrder?.customer_phone || '';
  const billNumber = bill?.billNumber || matchingOrder?.bill_number || billId;
  const dateStr = bill?.date || matchingOrder?.date || new Date().toLocaleDateString('en-GB');
  const items = bill?.items || matchingOrder?.items || [];
  const totalAmount = bill?.totalAmount || matchingOrder?.total_price || 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white font-sans">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="w-full max-w-2xl mb-4 flex justify-between items-center print:hidden">
        <Link
          href="/"
          className="text-xs font-bold text-gray-700 hover:text-purple-950 flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl shadow-xs border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" /> Sareethi Home
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Official Tax Invoice Container */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl print:shadow-none print:rounded-none border border-gray-200 print:border-none p-8 space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold tracking-tight text-purple-950">Sareethi</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                Official Receipt
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Premium Women's Sarees, Suits & Ethnic Wear</p>
            <p className="text-[11px] text-gray-400">Main Galleria, Deoghar, Jharkhand • GST: 20ABCDE1234F1Z5</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-purple-950 bg-purple-50 px-3 py-1 rounded-md border border-purple-100 block">
              {billNumber}
            </span>
            <span className="text-[11px] text-gray-500 block mt-1">Date: {dateStr}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Payment Confirmed
            </span>
          </div>
        </div>

        {/* Customer & Billed To */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Billed To Customer</span>
            <p className="font-bold text-gray-900 text-sm">{customerName}</p>
            <p className="text-gray-600 mt-0.5">{customerPhone || 'In-store Walk-in Customer'}</p>
          </div>
          <div className="text-right">
            <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Merchant Store</span>
            <p className="font-bold text-gray-900">Sareethi Fashion Retail</p>
            <p className="text-gray-600">contact@sareethi.com</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    No items recorded on this invoice.
                  </td>
                </tr>
              ) : (
                items.map((it: any, idx: number) => {
                  const name = it.product_name || it.name || 'Garment Item';
                  const price = it.unit_price || it.price || 0;
                  const qty = it.quantity || 1;
                  return (
                    <tr key={idx} className="text-gray-800">
                      <td className="py-3 font-semibold pr-2">
                        {name}
                        {it.captured_image_url && (
                          <span className="block text-[10px] text-gray-400 font-normal">Attached Garment Photo Verified</span>
                        )}
                      </td>
                      <td className="py-3 text-center">{qty}</td>
                      <td className="py-3 text-right">₹{price.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-gray-900">
                        ₹{(price * qty).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-center text-gray-900 font-bold">
          <div>
            <span className="text-xs text-gray-500 font-normal block">Total Items: {items.length}</span>
            <span className="text-xs text-emerald-700 font-normal">All Taxes & Packaging Included</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Grand Total Paid</span>
            <span className="text-2xl font-serif text-purple-950 font-bold">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Invoice Footer Note */}
        <div className="text-center pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-800">Thank you for choosing Sareethi!</p>
          <p className="text-[11px] text-gray-400">
            For returns or exchange queries, please present this invoice within 7 days of purchase.
          </p>
          <p className="text-[10px] font-mono text-purple-900 pt-2">https://sareethi.vercel.app</p>
        </div>
      </div>
    </div>
  );
}
