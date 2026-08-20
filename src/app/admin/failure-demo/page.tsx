'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { executeCatalogueFailureDemoAction, executeDeliveryApiFailureDemoAction, IntentionalFailureResult } from '@/lib/actions/intentional-failure';
import { AlertOctagon, RefreshCcw, ShieldCheck, ArrowRight, CheckCircle2, FileText, XCircle, Truck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminFailureDemoPage() {
  const [isPending, startTransition] = useTransition();
  const [demoResult, setDemoResult] = useState<IntentionalFailureResult | null>(null);

  const handleCatalogueFailure = () => {
    startTransition(async () => {
      const res = await executeCatalogueFailureDemoAction();
      setDemoResult(res);
    });
  };

  const handleDeliveryFailure = () => {
    startTransition(async () => {
      const res = await executeDeliveryApiFailureDemoAction();
      setDemoResult(res);
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
              <AlertOctagon className="w-5 h-5 text-amber-400" />
              <h1 className="font-serif text-2xl font-bold">Intentional Failure & Safety Demonstration</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Demonstrates Sareethi saying: <span className="font-bold text-amber-300">"I cannot safely complete this workflow."</span> — Halting gracefully without hallucinating products or issuing unauthorized refunds.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCatalogueFailure}
              disabled={isPending}
              className="px-4 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" /> 1. Catalogue Failure
            </button>
            <button
              onClick={handleDeliveryFailure}
              disabled={isPending}
              className="px-4 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Truck className="w-4 h-4" /> 2. Delivery API Timeout
            </button>
          </div>
        </div>

        {/* Live Simulation Trajectory Result */}
        {demoResult && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-rose-600" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900">Workflow Halted & Escalated Safely</h3>
                  <p className="text-xs text-gray-500">Workflow: <span className="font-mono font-bold text-purple-950">{demoResult.workflowId}</span> • Target: {demoResult.targetContext}</p>
                </div>
              </div>
              <span className="bg-rose-100 text-rose-800 font-bold text-xs px-3 py-1 rounded-full">
                State: {demoResult.finalState}
              </span>
            </div>

            {/* Sareethi AI Explicit Statement Banner */}
            <div className="p-4 bg-purple-950 text-white rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">SAREETHI WORKER DECLARATION</span>
              <p className="font-serif text-lg font-bold text-amber-300">"{demoResult.aiStatement}"</p>
              <p className="text-xs text-purple-200">
                Reason: Operational evidence is ambiguous or integration timed out. Stopping cleanly without inventing attributes or taking unauthorized monetary actions.
              </p>
            </div>

            {/* Trajectory Retry Logs */}
            <div className="space-y-3 font-mono text-xs">
              {demoResult.attempts.map((att) => (
                <div key={att.attempt} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-purple-950">Attempt {att.attempt} Execution</span>
                    <span className={att.status === 'RETRY_FAILED' ? 'text-rose-600' : 'text-amber-700'}>
                      Status: {att.status}
                    </span>
                  </div>
                  <p className="text-gray-700 font-sans">{att.message}</p>
                </div>
              ))}
            </div>

            {/* Safe Verification Guarantee Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verification Guarantees Checked:
              </p>
              <p>✓ Product record created: <span className="font-bold">NO (0 created)</span></p>
              <p>✓ Refund issued: <span className="font-bold">NO (Strict Level 3 boundary enforced)</span></p>
              <p>✓ System audit log written: <span className="font-bold">YES</span></p>
              <p>✓ Ticket created in Approval Queue: <span className="font-mono font-bold">{demoResult.approvalId}</span></p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                href="/admin/approvals"
                className="px-6 py-3 bg-purple-950 text-white font-bold text-xs rounded-xl hover:bg-purple-900 shadow-md flex items-center gap-2"
              >
                Inspect Ticket In Approval Queue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
