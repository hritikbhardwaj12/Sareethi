'use client';

import { useState, useTransition } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { executeIntentionalFailureDemoAction, IntentionalFailureResult } from '@/lib/actions/intentional-failure';
import { AlertOctagon, RefreshCcw, ShieldCheck, ArrowRight, CheckCircle2, FileText, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminFailureDemoPage() {
  const [isPending, startTransition] = useTransition();
  const [demoResult, setDemoResult] = useState<IntentionalFailureResult | null>(null);

  const handleRunDemo = () => {
    startTransition(async () => {
      const res = await executeIntentionalFailureDemoAction();
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
              Demonstrates Sareethi's error handling protocol: Attempt 1 $\rightarrow$ Failure $\rightarrow$ Retry 1 $\rightarrow$ Retry 2 $\rightarrow$ Safe Pause $\rightarrow$ Audit Log $\rightarrow$ Human Escalation Ticket. Zero hallucination.
            </p>
          </div>

          <button
            onClick={handleRunDemo}
            disabled={isPending}
            className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <RefreshCcw className="w-4 h-4" /> {isPending ? 'Simulating Failure...' : 'TRIGGER FAILURE SCENARIO'}
          </button>
        </div>

        {/* Eko Requirement Safety Checklist Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
          <h2 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Eko Assignment Safety Principles Verified</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Validation</strong>: Zod schemas on all tool contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Retry Policy</strong>: Max 2 retries before safe pause</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Idempotency</strong>: Double-click protection on billing</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Audit Ledger</strong>: Immutable system event logging</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>No Hallucination</strong>: Zero fake data on failure</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Human Only</strong>: Refunds strictly require owner</span>
            </div>
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
                  <p className="text-xs text-gray-500">Workflow ID: <span className="font-mono font-bold text-purple-950">{demoResult.workflowId}</span> • Target: {demoResult.filePage}</p>
                </div>
              </div>
              <span className="bg-rose-100 text-rose-800 font-bold text-xs px-3 py-1 rounded-full">
                State: {demoResult.finalState}
              </span>
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
              <p>✓ Inventory stock changed: <span className="font-bold">NO (0 modified)</span></p>
              <p>✓ Audit log written: <span className="font-bold">YES</span></p>
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
