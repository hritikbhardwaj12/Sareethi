'use client';

import { useState, useTransition, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getUpcomingFestivalsAction, runFestivalWorkerAction, dispatchBatchFestivalCampaignAction } from '@/lib/actions/festival-actions';
import { FestivalWorkflowExecutionResult, FestivalEventData } from '@/lib/ai/types';
import {
  Sparkles,
  Calendar,
  Play,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  ShieldCheck,
  RotateCw,
  Send,
  Lock,
  ArrowRight,
  ChevronRight,
  Cpu,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function AdminFestivalsPage() {
  const [selectedDate, setSelectedDate] = useState('2026-08-29'); // Defaults to today's real date (2026-08-29)
  const [upcomingFestivals, setUpcomingFestivals] = useState<FestivalEventData[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<any[]>([]);
  const [executionResult, setExecutionResult] = useState<FestivalWorkflowExecutionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [failureDemoActive, setFailureDemoActive] = useState(false);
  const [batchDispatchPending, setBatchDispatchPending] = useState(false);
  const [batchDispatchResult, setBatchDispatchResult] = useState<{ dispatchedCount: number; dispatchedCustomers: string[] } | null>(null);

  // Load festival calendar on date change
  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await getUpcomingFestivalsAction(selectedDate);
        setUpcomingFestivals(data.upcoming_festivals);
        setCampaignGroups(data.active_campaign_groups);
      } catch (err) {
        console.error('Error loading festival data:', err);
      }
    }
    loadCalendar();
  }, [selectedDate]);

  const handleRunWorker = (forceFailure: boolean = false) => {
    setFailureDemoActive(forceFailure);
    setBatchDispatchResult(null);
    startTransition(async () => {
      try {
        const result = await runFestivalWorkerAction({
          today: selectedDate,
          forceFailureDemo: forceFailure,
        });
        setExecutionResult(result);
      } catch (err: any) {
        console.error('Error executing festival worker:', err);
      }
    });
  };

  const handleDispatchBatchCampaign = async () => {
    if (!executionResult || !executionResult.decisions.length) return;
    setBatchDispatchPending(true);
    try {
      const res = await dispatchBatchFestivalCampaignAction({
        festivalName: executionResult.festival.name,
        decisions: executionResult.decisions,
      });
      setBatchDispatchResult(res);
    } catch (err) {
      console.error('Error in batch campaign dispatch:', err);
    } finally {
      setBatchDispatchPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-900 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-purple-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> FESTIVAL AI WORKER MODULE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400 animate-pulse" /> POLICY ENFORCED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
              Festival Follow-up & Campaign AI Worker
            </h1>
            <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
              Detects 2026 Indian festival windows, analyzes customer saree preferences & purchase history, enforces anti-spam consent rules, and generates personalized re-engagement communications with human discount approval gates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <div className="bg-purple-900/80 border border-purple-800 p-2.5 rounded-2xl flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <p className="text-[10px] text-purple-300">Simulate Date</p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => handleRunWorker(false)}
              disabled={isPending}
              className="px-5 py-3 bg-amber-400 text-purple-950 font-bold text-xs rounded-2xl hover:bg-amber-300 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending && !failureDemoActive ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" /> Executing Worker...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Run Festival AI Worker
                </>
              )}
            </button>

            <button
              onClick={() => handleRunWorker(true)}
              disabled={isPending}
              className="px-4 py-3 bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-700 font-semibold text-xs rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending && failureDemoActive ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" /> Testing Failure...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Test Schema Failure Demo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Execution Output & 15-Step Workflow Visualizer */}
        {executionResult && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    executionResult.state === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : executionResult.state === 'FAILED_ESCALATED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {executionResult.state === 'COMPLETED' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : executionResult.state === 'FAILED_ESCALATED' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <RotateCw className="w-6 h-6 animate-spin" />
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-gray-900">
                    Workflow Execution: <span className="font-mono text-purple-950">{executionResult.workflow_id}</span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Target Festival: <strong className="text-gray-800">{executionResult.festival.name}</strong> ({executionResult.festival.days_remaining} days remaining)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {executionResult.decisions.length > 0 && (
                  <button
                    onClick={handleDispatchBatchCampaign}
                    disabled={batchDispatchPending}
                    className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {batchDispatchPending ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" /> Dispatching Broadcast...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-amber-400" /> Broadcast Emails to All ({executionResult.decisions.length})
                      </>
                    )}
                  </button>
                )}

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    executionResult.state === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  STATE: {executionResult.state}
                </span>
              </div>
            </div>

            {/* Batch Dispatch Success Banner */}
            {batchDispatchResult && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs space-y-1 text-emerald-950 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Broadcast Campaign Sent Simultaneously to All Eligible Customers!
                </div>
                <p className="text-xs text-emerald-800">
                  Dispatched <strong>{batchDispatchResult.dispatchedCount}</strong> personalized festival follow-up emails in a batch process to: {batchDispatchResult.dispatchedCustomers.join(', ')}. Audit log recorded!
                </p>
              </div>
            )}

            {/* 15-Step Workflow Progress Visualizer */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">15-Step AI Worker Execution Lifecycle</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px] font-mono">
                {[
                  'FESTIVAL_DETECTED',
                  'CONTEXT_GATHERING',
                  'CUSTOMER_FILTERING',
                  'AI_REASONING',
                  'OUTPUT_VALIDATION',
                  'POLICY_CHECK',
                  'AUTO_EXECUTE',
                  'HUMAN_APPROVAL',
                  'SEND',
                  'AUDIT_LOG',
                  executionResult.state === 'FAILED_ESCALATED' ? 'FAILED_ESCALATED' : 'COMPLETED'
                ].map((step, idx) => {
                  const isCurrent = executionResult.state === step;
                  const isDone = executionResult.state === 'COMPLETED' || executionResult.state === 'FAILED_ESCALATED';
                  return (
                    <div
                      key={step}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-purple-950 text-amber-400 border-purple-900 font-bold shadow-md'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      <span className="block text-[9px] text-gray-400 font-sans">Step {idx + 1}</span>
                      <span className="truncate block font-bold">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intentional Failure Escalation Warning */}
            {executionResult.state === 'FAILED_ESCALATED' && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs space-y-2 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  Intentional Failure Demo: Output Schema Validation Failed & Escalated
                </div>
                <p className="text-xs text-rose-800">
                  {executionResult.error}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href="/admin/approvals"
                    className="px-3.5 py-1.5 bg-rose-900 text-white font-bold text-[11px] rounded-lg hover:bg-rose-800 transition-colors shadow-sm flex items-center gap-1"
                  >
                    View Escalated Approval Queue &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Decision Cards */}
            {executionResult.decisions.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-950" /> Personalized Re-engagement Recommendations ({executionResult.decisions.length})
                  </h3>

                  <button
                    onClick={handleDispatchBatchCampaign}
                    disabled={batchDispatchPending}
                    className="px-3 py-1.5 bg-amber-400 text-purple-950 font-bold text-xs rounded-xl shadow hover:bg-amber-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" /> Broadcast Campaign to All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {executionResult.decisions.map((dec) => (
                    <div key={dec.customer_id} className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-purple-950 text-sm">{dec.customer_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">ID: {dec.customer_id}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-amber-200">
                          Priority: {dec.campaign_priority}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                        <p className="text-[11px] font-semibold text-gray-700">AI Reasoning Evidence:</p>
                        <p className="text-gray-600 text-[11px] italic">{dec.reason}</p>
                      </div>

                      <div className="bg-purple-950 text-white p-3 rounded-xl space-y-1">
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Send className="w-3 h-3" /> Draft Customer Communication
                        </p>
                        <p className="text-xs text-purple-100 leading-relaxed font-sans">{dec.personalized_message}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-950" />
                          <span>Discount Proposed: <strong>{dec.suggested_discount_percent}%</strong></span>
                        </div>

                        {dec.suggested_discount_percent > 5 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Lock className="w-3 h-3 text-amber-600" /> Queued for Owner Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Permitted (&le; 5%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2026 Festival Calendar & Active Campaign Groups */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Active Campaign Groups */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> 2026 Festive Season Campaign Groups
              </h2>
              <span className="text-xs text-gray-500 font-mono">Date: {selectedDate}</span>
            </div>

            <p className="text-xs text-gray-500">
              The AI Worker groups overlapping festival dates (e.g. Navratri, Durga Puja & Dussehra) into singular campaign themes to prevent customer communication spam.
            </p>

            <div className="space-y-3">
              {campaignGroups.map((grp) => (
                <div key={grp.id} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-purple-950 text-xs">{grp.name}</p>
                    <span className="bg-purple-950 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                      {grp.priority}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {grp.target_tags.map((tag: string) => (
                      <span key={tag} className="bg-white text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">Campaign Starts: {grp.campaign_start_date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming 2026 Festivals Dataset */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-950" /> Upcoming Festivals Dataset
              </h2>
              <span className="bg-purple-100 text-purple-950 text-[10px] font-bold px-2 py-0.5 rounded">
                {upcomingFestivals.length} Active
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
              {upcomingFestivals.map((fest) => (
                <div key={fest.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 hover:bg-purple-50/40 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">{fest.name}</p>
                    <p className="text-[11px] text-gray-500">Date: {fest.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-purple-950 text-xs">
                      {fest.days_remaining}d remaining
                    </span>
                    <p className="text-[10px] text-emerald-700 font-bold uppercase">{fest.business_relevance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
