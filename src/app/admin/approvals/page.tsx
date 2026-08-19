'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { processApprovalAction } from '@/lib/actions/approvals';
import { Shield, Check, Edit3, X, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';

const INITIAL_APPROVALS = [
  {
    id: 'APPR-00101',
    type: 'CUSTOMER_FOLLOWUP',
    title: 'Customer Re-engagement Suggested: Priya Sharma',
    risk_level: 'LOW',
    status: 'PENDING',
    payload: {
      customer_name: 'Priya Sharma',
      days_inactive: 42,
      suggested_message: 'Hi Priya, we noticed you enjoyed our festive saree collection! We have added new Banarsi silk arrivals that you might love.',
    },
  },
  {
    id: 'APPR-00102',
    type: 'DELAY_ACTION',
    title: 'Delayed Order ORD-1028 Shipping Exception Response Draft',
    risk_level: 'MEDIUM',
    status: 'PENDING',
    payload: {
      order_id: 'ORD-1028',
      customer_name: 'Anita Roy',
      delay_hours: 8,
      suggested_message: 'Hi Anita, your Sareethi order (ORD-1028) has been slightly delayed in transit by 8 hours. We sincerely apologize and are expediting delivery today.',
    },
  },
  {
    id: 'APPR-00103',
    type: 'CLASSIFICATION_REVIEW',
    title: 'Uncertain Product Classification: Deep Maroon Velvet Saree',
    risk_level: 'MEDIUM',
    status: 'PENDING',
    payload: {
      sku: 'SAR-00006',
      confidence: 0.78,
      suggested_category: 'Saree',
      suggested_price: 2499,
    },
  },
];

export default function AdminApprovalsPage() {
  const [isPending, startTransition] = useTransition();
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);

  const handleDecision = (id: string, decision: 'APPROVED' | 'EDITED' | 'REJECTED') => {
    startTransition(async () => {
      await processApprovalAction(id, decision);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
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
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Human Approval Queue (Level 2)</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Store Owner Review Portal: Review AI recommendations for customer follow-ups, delayed order exceptions, and low-confidence product classifications.
            </p>
          </div>
          <span className="bg-purple-900 border border-purple-700 text-purple-200 font-mono text-[11px] px-3 py-1.5 rounded-full font-bold">
            {approvals.length} Pending Actions
          </span>
        </div>

        {/* Approval Queue Items */}
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
              <Check className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-gray-900">All Approvals Cleared!</h3>
              <p className="text-xs text-gray-500">There are no pending Level 2 AI recommendations requiring your review.</p>
            </div>
          ) : (
            approvals.map((appr) => (
              <div key={appr.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded">
                        {appr.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        appr.risk_level === 'LOW' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Risk: {appr.risk_level}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-gray-900">{appr.title}</h3>
                  </div>
                </div>

                {/* Payload Content Preview */}
                <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 border border-gray-100">
                  {appr.payload.suggested_message && (
                    <div className="space-y-1">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-950" /> Suggested Customer Message:
                      </span>
                      <p className="italic text-gray-800 bg-white p-3 rounded border border-gray-200">
                        "{appr.payload.suggested_message}"
                      </p>
                    </div>
                  )}
                  {appr.payload.sku && (
                    <p className="text-gray-700">
                      Product SKU: <span className="font-mono font-bold text-purple-950">{appr.payload.sku}</span> • AI Confidence: <span className="font-bold text-amber-700">{Math.round(appr.payload.confidence * 100)}%</span>
                    </p>
                  )}
                </div>

                {/* Owner Decision Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleDecision(appr.id, 'REJECTED')}
                    disabled={isPending}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> [ REJECT ]
                  </button>
                  <button
                    onClick={() => handleDecision(appr.id, 'EDITED')}
                    disabled={isPending}
                    className="px-4 py-2 border border-gray-300 font-bold text-xs rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4" /> [ EDIT & APPROVE ]
                  </button>
                  <button
                    onClick={() => handleDecision(appr.id, 'APPROVED')}
                    disabled={isPending}
                    className="px-5 py-2 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> [ APPROVE ]
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
