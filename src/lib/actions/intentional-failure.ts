'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { tool_write_audit_log } from '@/lib/ai/tools';

export interface FailureDemoStep {
  attempt: number;
  status: 'FAILED' | 'RETRY' | 'RETRY_FAILED' | 'ESCALATED';
  message: string;
  timestamp: string;
}

export interface IntentionalFailureResult {
  workflowId: string;
  filePage: string;
  attempts: FailureDemoStep[];
  finalState: 'RETRY_FAILED' | 'HUMAN_ESCALATION';
  approvalId: string;
  noProductCreated: boolean;
  noDataHallucinated: boolean;
}

export async function executeIntentionalFailureDemoAction(): Promise<IntentionalFailureResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const workflowId = `WF-CAT-FAIL-${Date.now().toString().slice(-4)}`;
  const filePage = 'Catalogue Page 17 (Corrupted Image & Contrast Error)';

  // 1. Create Workflow Record
  await supabase.from('ai_workflows').insert({
    id: workflowId,
    workflow_type: 'CATALOGUE_INGESTION',
    current_step: 'PROCESSING',
    status: 'RUNNING',
    payload_json: { target_page: 17, error: 'Low contrast / uninterpretable garment weave' },
  });

  const attempts: FailureDemoStep[] = [
    {
      attempt: 1,
      status: 'FAILED',
      message: 'Attempt 1: Optical vision OCR failed to extract product border on Page 17 (Confidence: 0.12).',
      timestamp: new Date().toISOString(),
    },
    {
      attempt: 2,
      status: 'RETRY',
      message: 'Attempt 2: Re-attempting parsing with contrast adjustment... Vision OCR failed again.',
      timestamp: new Date().toISOString(),
    },
    {
      attempt: 3,
      status: 'RETRY_FAILED',
      message: 'Attempt 3: Retry limit reached (3/3). Halting workflow step cleanly to prevent hallucination.',
      timestamp: new Date().toISOString(),
    },
  ];

  // 2. Transition Workflow State to RETRY_FAILED
  await supabase
    .from('ai_workflows')
    .update({ current_step: 'RETRY_FAILED', status: 'PAUSED', updated_at: new Date().toISOString() })
    .eq('id', workflowId);

  // 3. Create Ticket in Human Approval Queue
  const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;

  await supabase.from('approvals').insert({
    id: approvalId,
    workflow_id: workflowId,
    type: 'CLASSIFICATION_REVIEW',
    title: `Catalogue Ingestion Halted: Page 17 Uninterpretable`,
    payload_json: {
      workflow_id: workflowId,
      page: 17,
      error: 'Vision OCR retry limit (3/3) exceeded. Human review required.',
      action_required: 'Manual crop / price entry by store owner',
    },
    risk_level: 'HIGH',
    status: 'PENDING',
  });

  // 4. Immutable Audit Log Entry
  await tool_write_audit_log({
    action: 'WORKFLOW_INTENTIONAL_FAILURE_ESCALATED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details: {
      workflow_id: workflowId,
      page: 17,
      retries_attempted: 3,
      approval_ticket: approvalId,
      no_product_created: true,
      no_data_hallucinated: true,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/failure-demo');

  return {
    workflowId,
    filePage,
    attempts,
    finalState: 'HUMAN_ESCALATION',
    approvalId,
    noProductCreated: true,
    noDataHallucinated: true,
  };
}
