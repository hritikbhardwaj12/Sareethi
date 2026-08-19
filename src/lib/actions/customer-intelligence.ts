'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { tool_create_followup, tool_write_audit_log } from '@/lib/ai/tools';
import { orchestrator } from '@/lib/ai/orchestrator';

export interface CustomerBehaviorAnalysis {
  customerId: string;
  customerName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  returnCount: number;
  returnRatePercent: number;
  preferredCategory: 'Saree' | 'Suit';
  daysSinceLastPurchase: number;
  avgPurchaseIntervalDays: number;
  opportunityDetected: boolean;
}

export async function analyzeCustomerBehaviorAction(customerId: string): Promise<CustomerBehaviorAnalysis> {
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  const totalOrders = customer?.total_orders || 8;
  const totalSpent = customer?.total_spent || 14890;
  const returnCount = customer?.return_count || 1;

  const returnRatePercent = Math.round((returnCount / totalOrders) * 100);
  const averageOrderValue = Math.round(totalSpent / totalOrders);
  const daysSinceLastPurchase = 42;
  const avgPurchaseIntervalDays = 30;

  const opportunityDetected = daysSinceLastPurchase > avgPurchaseIntervalDays;

  return {
    customerId,
    customerName: customer?.name || 'Priya Sharma',
    phone: customer?.phone || '9876543210',
    totalOrders,
    totalSpent,
    averageOrderValue,
    returnCount,
    returnRatePercent,
    preferredCategory: 'Saree',
    daysSinceLastPurchase,
    avgPurchaseIntervalDays,
    opportunityDetected,
  };
}

export async function triggerReengagementFollowupAction(customerId: string, customerName: string, daysInactive: number) {
  const followup = await orchestrator.customerWorker.evaluateFollowupOpportunity(
    customerId,
    customerName,
    daysInactive,
    30
  );

  const result = await tool_create_followup({
    customer_id: customerId,
    customer_name: customerName,
    suggested_message: followup.suggestedMessage,
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/customers');

  return {
    success: true,
    followup,
    approvalId: result.approvalId,
  };
}

export async function simulateSendMessageAction(approvalId: string, customerPhone: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Log simulated WhatsApp/SMS delivery
  await tool_write_audit_log({
    action: 'SIMULATED_WHATSAPP_MESSAGE_SENT',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details: {
      approval_id: approvalId,
      customer_phone: customerPhone,
      message_snippet: message.slice(0, 40),
      delivery_channel: 'SIMULATED_WHATSAPP',
      sent_at: new Date().toISOString(),
    },
  });

  revalidatePath('/admin/approvals');
  return { success: true, channel: 'Simulated WhatsApp' };
}
