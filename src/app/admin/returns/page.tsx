'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { processReturnAction } from '@/lib/actions/returns-exceptions';
import { RotateCcw, Search, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MOCK_BILL_DATABASE = {
  'INV-20260820-0042': {
    billNumber: 'INV-20260820-0042',
    customerName: 'Priya Sharma',
    date: '20 Aug 2026',
    items: [
      {
        product_id: 'SAR-00001',
        product_name: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
        unit_price: 1299,
        quantity: 1,
      },
      {
        product_id: 'SUIT-00001',
        product_name: 'Royal Blue Straight Chanderi Silk Suit Set With Dupatta',
        unit_price: 1899,
        quantity: 1,
      },
    ],
  },
};

export default function AdminReturnsPage() {
  const [isPending, startTransition] = useTransition();
  const [searchBill, setSearchBill] = useState('INV-20260820-0042');
  const [selectedBill, setSelectedBill] = useState<any | null>(MOCK_BILL_DATABASE['INV-20260820-0042']);
  const [selectedItems, setSelectedItems] = useState<string[]>(['SAR-00001']);
  const [reason, setReason] = useState('Size Fit Issue');
  const [returnConfirmed, setReturnConfirmed] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = (MOCK_BILL_DATABASE as any)[searchBill.trim()];
    if (found) {
      setSelectedBill(found);
      setReturnConfirmed(null);
    } else {
      alert('Bill number not found in database.');
    }
  };

  const toggleItemSelect = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const handleConfirmReturn = () => {
    if (!selectedBill || selectedItems.length === 0) return;

    const itemsToReturn = selectedBill.items.filter((i: any) => selectedItems.includes(i.product_id));

    startTransition(async () => {
      const res = await processReturnAction({
        bill_number: selectedBill.billNumber,
        returned_items: itemsToReturn,
        reason,
      });
      setReturnConfirmed(res);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Customer Returns & Restock Desk</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Lookup customer invoice, select returned garments, confirm return value, restock inventory, and update customer history.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            Inventory Restock Cascade
          </span>
        </div>

        {/* Bill Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex gap-3">
          <input
            type="text"
            placeholder="Enter Invoice Number (e.g. INV-20260820-0042)"
            value={searchBill}
            onChange={(e) => setSearchBill(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-purple-950 focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 flex items-center gap-1.5 shadow-sm"
          >
            <Search className="w-4 h-4" /> FIND BILL
          </button>
        </form>

        {returnConfirmed ? (
          /* Return Confirmation Result */
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg text-center space-y-4 max-w-xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-gray-900">Return Confirmed & Restocked!</h2>
            <p className="text-xs text-gray-600">
              Return Reference: <span className="font-mono font-bold text-purple-950">{returnConfirmed.returnId}</span> • Refund Value: <span className="font-bold text-rose-600">₹{returnConfirmed.totalRefundAmount.toLocaleString()}</span>
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1 text-left">
              <p>✓ Inventory quantities re-incremented in DB</p>
              <p>✓ Revenue & profit metrics adjusted on Dashboard</p>
              <p>✓ Customer return history updated</p>
              <p>✓ System audit log recorded</p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setReturnConfirmed(null)}
                className="px-6 py-2.5 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md"
              >
                Process Another Return
              </button>
            </div>
          </div>
        ) : selectedBill ? (
          /* Item Selection Table */
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900">Bill Details: {selectedBill.billNumber}</h2>
                <p className="text-xs text-gray-500">Customer: {selectedBill.customerName} • Date: {selectedBill.date}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-gray-700">Select Items Being Returned:</label>
              {selectedBill.items.map((item: any) => {
                const isSelected = selectedItems.includes(item.product_id);
                return (
                  <div
                    key={item.product_id}
                    onClick={() => toggleItemSelect(item.product_id)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'border-purple-950 bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-purple-950 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.product_name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">SKU: {item.product_id}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.unit_price.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 text-xs mb-1">Reason for Return</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-950 focus:outline-none bg-white"
              >
                <option value="Size Fit Issue">Size / Fit Issue</option>
                <option value="Color Discrepancy">Color Discrepancy</option>
                <option value="Customer Changed Mind">Customer Changed Mind</option>
                <option value="Minor Weave Defect">Minor Weave Defect</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-500">Selected Refund Value:</span>
                <p className="text-xl font-bold text-rose-600">
                  ₹{selectedBill.items
                    .filter((i: any) => selectedItems.includes(i.product_id))
                    .reduce((sum: number, i: any) => sum + i.unit_price * i.quantity, 0)
                    .toLocaleString()}
                </p>
              </div>

              <button
                onClick={handleConfirmReturn}
                disabled={isPending || selectedItems.length === 0}
                className="px-6 py-3.5 bg-purple-950 text-white font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-purple-900 shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? 'Processing Restock...' : 'CONFIRM RETURN & RESTOCK'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
