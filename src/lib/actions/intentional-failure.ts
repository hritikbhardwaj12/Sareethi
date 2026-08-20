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
  failureType: 'CATALOGUE_CORRUPTION' | 'DELIVERY_API_TIMEOUT';
  targetContext: string;
  attempts: FailureDemoStep[];
  finalState: 'RETRY_FAILED' | 'HUMAN_ESCALATION';
  approvalId: string;
  noProductCreated: boolean;
  noDataHallucinated: boolean;
  noRefundIssued: boolean;
  aiStatement: string;
}

export async function executeCatalogueFailureDemoAction(): Promise<IntentionalFailureResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const workflowId = `WF-CAT-FAIL-${Date.now().toString().slice(-4)}`;
  const targetContext = 'Catalogue Page 17 (Corrupted Garment Weave Image & Low Contrast)';

  await supabase.from('ai_workflows').insert({
    id: workflowId,
    workflow_type: 'CATALOGUE_INGESTION',
    current_step: 'PROCESSING',
    status: 'RUNNING',
    payload_json: { target_page: 17, error: 'Uninterpretable image contrast' },
  });

  const attempts: FailureDemoStep[] = [
    {
      attempt: 1,
      status: 'FAILED',
      message: 'Attempt 1: Optical vision OCR failed to extract saree border on Page 17 (Confidence: 0.12).',
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

  await supabase
    .from('ai_workflows')
    .update({ current_step: 'RETRY_FAILED', status: 'PAUSED', updated_at: new Date().toISOString() })
    .eq('id', workflowId);

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
      ai_statement: 'I cannot safely complete this workflow without human intervention.',
    },
    risk_level: 'HIGH',
    status: 'PENDING',
  });

  await tool_write_audit_log({
    action: 'WORKFLOW_CATALOGUE_FAILURE_ESCALATED',
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
    failureType: 'CATALOGUE_CORRUPTION',
    targetContext,
    attempts,
    finalState: 'HUMAN_ESCALATION',
    approvalId,
    noProductCreated: true,
    noDataHallucinated: true,
    noRefundIssued: true,
    aiStatement: 'I cannot safely complete this workflow.',
  };
}

export async function executeDeliveryApiFailureDemoAction(): Promise<IntentionalFailureResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const workflowId = `WF-DELIV-FAIL-${Date.now().toString().slice(-4)}`;
  const targetContext = 'Courier Delivery Status API (ORD-1028 Shipping Gateway)';

  await supabase.from('ai_workflows').insert({
    id: workflowId,
    workflow_type: 'ORDER_DELIVERY_TRACKING',
    current_step: 'PROCESSING',
    status: 'RUNNING',
    payload_json: { order_id: 'ORD-1028', error: 'HTTP 504 Gateway Timeout' },
  });

  const attempts: FailureDemoStep[] = [
    {
      attempt: 1,
      status: 'FAILED',
      message: 'Attempt 1: Courier Shipping API connection timed out (HTTP 504 Gateway Timeout).',
      timestamp: new Date().toISOString(),
    },
    {
      attempt: 2,
      status: 'RETRY',
      message: 'Attempt 2: Re-attempting API connection with exponential backoff... Timeout again.',
      timestamp: new Date().toISOString(),
    },
    {
      attempt: 3,
      status: 'RETRY_FAILED',
      message: 'Attempt 3: Retry limit reached (3/3). Stopping workflow safely. No automatic refund issued.',
      timestamp: new Date().toISOString(),
    },
  ];

  await supabase
    .from('ai_workflows')
    .update({ current_step: 'RETRY_FAILED', status: 'PAUSED', updated_at: new Date().toISOString() })
    .eq('id', workflowId);

  const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;

  await supabase.from('approvals').insert({
    id: approvalId,
    workflow_id: workflowId,
    type: 'DELAY_ACTION',
    title: `Delivery Service Unavailable: ORD-1028 API Connection Timeout`,
    payload_json: {
      order_id: 'ORD-1028',
      error: 'Delivery API Connection Timeout (3/3 retries). No automatic refund issued.',
      ai_statement: 'I cannot safely complete this workflow without store owner authorization.',
    },
    risk_level: 'HIGH',
    status: 'PENDING',
  });

  await tool_write_audit_log({
    action: 'WORKFLOW_DELIVERY_FAILURE_ESCALATED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details: {
      workflow_id: workflowId,
      order_id: 'ORD-1028',
      retries_attempted: 3,
      approval_ticket: approvalId,
      no_refund_issued: true,
      no_data_hallucinated: true,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/failure-demo');

  return {
    workflowId,
    failureType: 'DELIVERY_API_TIMEOUT',
    targetContext,
    attempts,
    finalState: 'HUMAN_ESCALATION',
    approvalId,
    noProductCreated: true,
    noDataHallucinated: true,
    noRefundIssued: true,
    aiStatement: 'I cannot safely complete this workflow.',
  };
}
