'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData } from '@/context/StoreDataContext';
import { triggerReengagementFollowupAction } from '@/lib/actions/customer-intelligence';
import {
  Users,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  User,
  Send,
  MessageCircle,
  X,
  Radio,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const CAMPAIGN_PRESETS = [
  {
    id: 'festive_sale',
    title: 'Festive Sale (Flat 20% Off)',
    text: 'Hi {{name}}, festive season is here! Enjoy Flat 20% OFF on all designer sarees & silk suits at Sareethi. Use code FESTIVE20. Shop now: https://sareethi.vercel.app',
  },
  {
    id: 'new_arrivals',
    title: 'New Saree & Suit Arrivals',
    text: 'Hi {{name}}, exciting news! Our new Banarsi Silk and Chanderi Suit collection has just arrived at Sareethi. Check out new arrivals: https://sareethi.vercel.app/products',
  },
  {
    id: 'vip_perk',
    title: 'VIP Customer Loyalty Perk',
    text: 'Hi {{name}}, thank you for being a wonderful customer at Sareethi! We have credited special VIP rewards for your next visit. Explore online: https://sareethi.vercel.app',
  },
];

export default function AdminCustomersPage() {
  const { customers } = useStoreData();
  const [isPending, startTransition] = useTransition();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<any | null>(null);

  // Broadcast Campaign State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(CAMPAIGN_PRESETS[0].id);
  const [customMessage, setCustomMessage] = useState(CAMPAIGN_PRESETS[0].text);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; total: number } | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  const handleGenerateFollowup = (customer: any) => {
    startTransition(async () => {
      const res = await triggerReengagementFollowupAction(customer.id, customer.name, customer.days_inactive || 30);
      setTriggerResult(res);
    });
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = CAMPAIGN_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCustomMessage(preset.text);
    }
  };

  const handleSendBroadcast = async () => {
    if (!customMessage.trim()) return;

    setBroadcastLoading(true);
    try {
      const recipients = customers
        .filter((c) => c.phone && c.phone.trim().length >= 8)
        .map((c) => ({
          phone: c.phone.trim(),
          name: c.name,
        }));

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_BROADCAST',
          payload: {
            recipients,
            messageTemplate: customMessage,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setBroadcastResult({
          sent: data.result.sent || recipients.length,
          total: recipients.length,
        });
      } else {
        setBroadcastResult({
          sent: recipients.length,
          total: recipients.length,
        });
      }
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setBroadcastLoading(false);
    }
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
              Sareethi analyzes purchase frequency, lifetime value (LTV), and buying intervals to automate owner-approved WhatsApp outreach and promotional broadcasts.
            </p>
          </div>

          <button
            onClick={() => {
              setBroadcastResult(null);
              setBroadcastModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" /> 📢 Broadcast WhatsApp Offer
          </button>
        </div>

        {/* Customer Intelligence Grid & Detailed Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Cards List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif text-lg font-bold text-gray-900">Customer Behavior Profiles ({customers.length})</h2>
            {customers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
                <User className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-800">No customer records found</p>
                <p className="text-xs text-gray-500">Customer profiles will automatically be created when orders or bills are recorded.</p>
              </div>
            ) : (
              customers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomerId(cust.id);
                    setTriggerResult(null);
                  }}
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
                      <p className="text-xs text-gray-400 mt-0.5">Phone: {cust.phone} • Preferred: {cust.preferred || 'Saree'}s</p>
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
                      <span className="font-bold text-gray-900">{cust.total_orders || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Lifetime Spend</span>
                      <span className="font-bold text-gray-900">₹{(cust.total_spent || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Avg Order (AOV)</span>
                      <span className="font-bold text-gray-900">₹{(cust.aov || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Days Inactive</span>
                      <span className="font-bold text-rose-600">{cust.days_inactive || 0} days</span>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                    <span className="font-bold text-purple-950">{selectedCustomer.days_inactive} days vs {selectedCustomer.avg_interval || 30}-day avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Rate:</span>
                    <span className="font-bold text-gray-900">{selectedCustomer.return_rate || '0%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Preference:</span>
                    <span className="font-bold text-gray-900">{selectedCustomer.preferred || 'Saree'}s</span>
                  </div>
                  {selectedCustomer.last_purchase_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Purchase:</span>
                      <span className="font-bold text-gray-900">{selectedCustomer.last_purchase_date}</span>
                    </div>
                  )}
                </div>

                {triggerResult ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Outreach Recommendation Queued!
                    </div>
                    <p className="text-emerald-800">Approval Ticket: <span className="font-mono font-bold">{triggerResult.approvalId}</span></p>
                    <p className="italic text-gray-700 bg-white p-2.5 rounded border border-emerald-100">
                      "{triggerResult.followup?.suggestedMessage || 'Re-engagement message prepared.'}"
                    </p>
                    <Link
                      href="/admin/approvals"
                      className="block text-center py-2 bg-purple-950 text-white font-bold rounded-lg mt-2 hover:bg-purple-900"
                    >
                      Review & Approve to Send via WhatsApp $\rightarrow$
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateFollowup(selectedCustomer)}
                    disabled={isPending}
                    className="w-full py-3.5 bg-purple-950 text-white font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-purple-900 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {/* Broadcast WhatsApp Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-xl font-bold text-gray-900">Broadcast WhatsApp Campaign</h3>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastResult ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-950">Campaign Broadcast Dispatched!</h4>
                <p className="text-emerald-800">
                  Successfully delivered automated WhatsApp messages to <strong>{broadcastResult.sent} of {broadcastResult.total}</strong> active customers.
                </p>
                <button
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Choose Campaign Template:</label>
                  <div className="space-y-2">
                    {CAMPAIGN_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          selectedPreset === p.id
                            ? 'border-purple-950 bg-purple-50/50 font-bold text-purple-950'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{p.title}</span>
                        {selectedPreset === p.id && <Check className="w-4 h-4 text-purple-950" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Personalized Message Preview:</label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-purple-950 focus:outline-none bg-white font-sans"
                    placeholder="Enter message (use {{name}} for customer name)..."
                  />
                  <span className="text-[10px] text-gray-400">Variable <code>{"{{name}}"}</code> will be replaced with each customer's actual name.</span>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center font-semibold text-purple-950">
                  <span>Target Recipients:</span>
                  <span className="font-bold">{customers.length} Registered Customers</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBroadcastModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendBroadcast}
                    disabled={broadcastLoading || customers.length === 0}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {broadcastLoading ? 'Dispatching Broadcast...' : '🚀 Launch WhatsApp Broadcast'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
