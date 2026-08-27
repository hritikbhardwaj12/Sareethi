'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useStoreData } from '@/context/StoreDataContext';
import { processApprovalAction } from '@/lib/actions/approvals';
import { Shield, Check, Edit3, X, AlertTriangle, Sparkles, MessageSquare, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function AdminApprovalsPage() {
  const { approvals, processApproval, customers } = useStoreData();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');

  const startEditing = (appr: any) => {
    setEditingId(appr.id);
    const suggestedMsg = appr.details?.suggested_message || appr.payload?.suggested_message || '';
    setEditedMessage(suggestedMsg);
    const custName = appr.customer || appr.payload?.customer_name || '';
    const foundCust = customers.find(
      (c) => c.name.toLowerCase() === custName.toLowerCase()
    );
    setEditedEmail(appr.email || appr.payload?.customer_email || foundCust?.email || 'customer@example.com');
  };

  const handleDecision = (id: string, decision: 'APPROVED' | 'EDITED' | 'REJECTED', customMsg?: string, customEmail?: string) => {
    const targetApproval = approvals.find((a) => a.id === id);

    startTransition(async () => {
      // 1. Process in local store context
      await processApproval(id, decision);

      // 2. Automated Email Follow-Up Delivery if approved or edited & approved
      if (decision === 'APPROVED' || decision === 'EDITED') {
        const customer = customEmail ? 'Valued Customer' : (targetApproval?.customer || targetApproval?.payload?.customer_name || 'Customer');
        const msg = customMsg || editedMessage || targetApproval?.details?.suggested_message || targetApproval?.payload?.suggested_message || 'Thank you for shopping at Sareethi!';

        // Lookup customer email from ticket, payload, or context
        const foundCust = customers.find(
          (c) => c.name.toLowerCase() === customer.toLowerCase()
        );
        const email = customEmail || editedEmail || targetApproval?.email || targetApproval?.payload?.customer_email || foundCust?.email || 'customer@example.com';

        try {
          const res = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'SEND_FOLLOWUP',
              payload: {
                to: email,
                customerName: customer,
                messageText: msg,
                subject: `Special Update from Sareethi Fashion Retail for ${customer}`,
              },
            }),
          });
          const data = await res.json();
          if (data.success) {
            setToastMessage(`📧 Follow-up email successfully delivered to ${email}!`);
            setTimeout(() => setToastMessage(null), 6000);
          } else {
            setToastMessage(`❌ Email Error: ${data.error || 'Failed to deliver email'}`);
            setTimeout(() => setToastMessage(null), 8000);
          }
        } catch (e: any) {
          console.error('Failed to send follow-up email:', e);
          setToastMessage(`❌ Network Error: ${e.message}`);
        }
      }

      // Reset edit mode if active
      setEditingId(null);

      // 3. Process via server action
      try {
        await processApprovalAction(id, decision);
      } catch (e) {
        // Safe fallback
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-purple-950 text-white px-6 py-4 rounded-2xl shadow-xl border border-purple-800 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm font-semibold">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-amber-400 hover:text-white font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-purple-950 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Human Approval Queue (Level 2)</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Store Owner Review Portal: Review AI recommendations for customer follow-ups, delayed order exceptions, and low-confidence product classifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-2 rounded-xl font-bold">
              {pendingApprovals.length} Pending Actions
            </span>
          </div>
        </div>

        {/* Approval Queue Items */}
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <Check className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-gray-900">All Approvals Cleared!</h3>
              <p className="text-xs text-gray-500">There are no pending Level 2 AI recommendations requiring your review.</p>
            </div>
          ) : (
            pendingApprovals.map((appr) => {
              const isEditingThis = editingId === appr.id;
              const foundCust = customers.find(
                (c) => c.name.toLowerCase() === (appr.payload?.customer_name || '').toLowerCase()
              );
              const defaultTargetEmail = appr.payload?.customer_email || foundCust?.email || 'customer@example.com';

              return (
                <div key={appr.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                          {appr.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            appr.risk === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Risk: {appr.risk}
                        </span>
                        <span className="text-xs text-gray-400">{appr.date || appr.created_at}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-gray-900">{appr.title}</h3>
                    </div>

                    {/* Delivery Channel Badges */}
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-600" /> Email Follow-Up: Active
                      </span>
                    </div>
                  </div>

                  {/* Payload Content Preview & Inline Editor */}
                  <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-3 border border-gray-100">
                    {(appr.details?.suggested_message || appr.payload?.suggested_message) && !isEditingThis && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-semibold text-gray-700 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-950" /> Suggested Customer Message:
                          </span>
                          <span className="text-gray-500 text-[11px]">
                            Recipient Email: <strong className="text-purple-950">{appr.email || defaultTargetEmail}</strong>
                          </span>
                        </div>
                        <p className="italic text-gray-800 bg-white p-3 rounded border border-gray-200">
                          "{appr.details?.suggested_message || appr.payload?.suggested_message}"
                        </p>
                      </div>
                    )}

                    {/* Inline Editor for Edit & Approve */}
                    {isEditingThis && (
                      <div className="bg-white p-4 rounded-xl border border-purple-200 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-purple-950 flex items-center gap-1">
                            <Edit3 className="w-4 h-4 text-purple-700" /> Edit Follow-Up Message & Email
                          </label>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Target Customer Email:</label>
                          <input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:ring-2 focus:ring-purple-900 focus:outline-none"
                            placeholder="customer@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Custom Message Text:</label>
                          <textarea
                            rows={3}
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-serif text-gray-900 focus:ring-2 focus:ring-purple-900 focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleDecision(appr.id, 'EDITED', editedMessage, editedEmail)}
                            disabled={isPending}
                            className="px-4 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" /> Save & Send Email Follow-Up
                          </button>
                        </div>
                      </div>
                    )}

                    {appr.payload?.order_id && (
                      <p className="text-gray-700">
                        Target Order: <span className="font-mono font-bold text-purple-950">{appr.payload.order_id}</span> • Customer: <span className="font-semibold">{appr.payload.customer_name}</span>
                      </p>
                    )}
                    {appr.payload?.sku && (
                      <p className="text-gray-700">
                        Product SKU: <span className="font-mono font-bold text-purple-950">{appr.payload.sku}</span> • AI Confidence: <span className="font-bold text-amber-700">{Math.round((appr.payload.confidence || 0.8) * 100)}%</span>
                      </p>
                    )}
                  </div>

                  {/* Owner Decision Action Buttons */}
                  {!isEditingThis && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 flex-wrap">
                      <button
                        onClick={() => handleDecision(appr.id, 'REJECTED')}
                        disabled={isPending}
                        className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> [ REJECT ]
                      </button>
                      <button
                        onClick={() => startEditing(appr)}
                        disabled={isPending}
                        className="px-4 py-2 border border-gray-300 font-bold text-xs rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> [ EDIT & APPROVE ]
                      </button>
                      <button
                        onClick={() => handleDecision(appr.id, 'APPROVED')}
                        disabled={isPending}
                        className="px-5 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> [ APPROVE & SEND EMAIL ]
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

