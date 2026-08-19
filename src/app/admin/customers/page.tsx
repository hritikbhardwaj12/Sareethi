'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { triggerReengagementFollowupAction, simulateSendMessageAction } from '@/lib/actions/customer-intelligence';
import { Users, Sparkles, TrendingUp, RotateCcw, Clock, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const MOCK_CUSTOMERS = [
  {
    id: 'CUST-00101',
    name: 'Priya Sharma',
    phone: '9876543210',
    total_orders: 8,
    total_spent: 14890,
    aov: 1861,
    return_rate: '12.5%',
    preferred: 'Saree',
    days_inactive: 42,
    avg_interval: 30,
    status: 'OPPORTUNITY_DETECTED',
  },
  {
    id: 'CUST-00102',
    name: 'Anita Roy',
    phone: '9812345678',
    total_orders: 5,
    total_spent: 9495,
    aov: 1899,
    return_rate: '0%',
    preferred: 'Suit',
    days_inactive: 14,
    avg_interval: 25,
    status: 'ACTIVE_RECENT',
  },
  {
    id: 'CUST-00103',
    name: 'Meera Patel',
    phone: '9898765432',
    total_orders: 12,
    total_spent: 24980,
    aov: 2081,
    return_rate: '8.3%',
    preferred: 'Saree',
    days_inactive: 55,
    avg_interval: 35,
    status: 'OPPORTUNITY_DETECTED',
  },
];

export default function AdminCustomersPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(MOCK_CUSTOMERS[0]);
  const [triggerResult, setTriggerResult] = useState<any | null>(null);

  const handleGenerateFollowup = (customer: any) => {
    startTransition(async () => {
      const res = await triggerReengagementFollowupAction(customer.id, customer.name, customer.days_inactive);
      setTriggerResult(res);
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
              <Users className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Customer Intelligence & Re-engagement Engine</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Sareethi analyzes purchase frequency, lifetime value (LTV), return rates, and buying interval velocity to automatically draft owner-approved outreach.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            Behavioral Velocity Worker
          </span>
        </div>

        {/* Customer Intelligence Grid & Detailed Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Cards List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif text-lg font-bold text-gray-900">Customer Behavior Profiles ({MOCK_CUSTOMERS.length})</h2>
            {MOCK_CUSTOMERS.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 cursor-pointer transition-all ${
                  selectedCustomer?.id === cust.id ? 'border-purple-950 ring-1 ring-purple-950' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                        {cust.id}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base">{cust.name}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Phone: {cust.phone} • Preferred: {cust.preferred}</p>
                  </div>

                  {cust.status === 'OPPORTUNITY_DETECTED' ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Re-engagement Due
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Active Customer
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Orders</span>
                    <span className="font-bold text-gray-900">{cust.total_orders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Lifetime Spend</span>
                    <span className="font-bold text-gray-900">₹{cust.total_spent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Avg Order (AOV)</span>
                    <span className="font-bold text-gray-900">₹{cust.aov.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Days Inactive</span>
                    <span className="font-bold text-rose-600">{cust.days_inactive} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Detailed Customer Insights & Action Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 h-fit sticky top-24">
            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-950">AI BEHAVIORAL INSIGHT</span>
                  <h3 className="font-serif text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">Buying Velocity Analysis</p>
                </div>

                <div className="bg-purple-50/60 p-4 rounded-xl space-y-2 text-xs border border-purple-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Observed Purchase Velocity:</span>
                    <span className="font-bold text-purple-950">{selectedCustomer.days_inactive} days vs {selectedCustomer.avg_interval}-day avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Rate:</span>
                    <span className="font-bold text-gray-900">{selectedCustomer.return_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Preference:</span>
                    <span className="font-bold text-gray-900">{selectedCustomer.preferred}s</span>
                  </div>
                </div>

                {triggerResult ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Outreach Recommendation Queued!
                    </div>
                    <p className="text-emerald-800">Approval Ticket: <span className="font-mono font-bold">{triggerResult.approvalId}</span></p>
                    <p className="italic text-gray-700 bg-white p-2.5 rounded border border-emerald-100">
                      "{triggerResult.followup.suggestedMessage}"
                    </p>
                    <Link
                      href="/admin/approvals"
                      className="block text-center py-2 bg-purple-950 text-white font-bold rounded-lg mt-2 hover:bg-purple-900"
                    >
                      Review In Approval Queue $\rightarrow$
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateFollowup(selectedCustomer)}
                    disabled={isPending}
                    className="w-full py-3.5 bg-purple-950 text-white font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-purple-900 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {isPending ? 'Analyzing & Drafting...' : 'GENERATE AI FOLLOW-UP OUTREACH'}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
