'use server';

import { festivalWorker } from '@/lib/ai/festival-worker';
import { tool_get_upcoming_festivals } from '@/lib/ai/festival-tools';
import { sendEmail } from '@/lib/email/mailer';
import { createClient } from '@/lib/supabase/server';
import { FestivalDecisionData } from '@/lib/ai/types';
import { revalidatePath } from 'next/cache';

export async function getUpcomingFestivalsAction(today?: string) {
  return await tool_get_upcoming_festivals({ today: today || '2026-08-29', lookahead_days: 120 });
}

export async function runFestivalWorkerAction(options: {
  today?: string;
  forceFailureDemo?: boolean;
}) {
  const result = await festivalWorker.runFestivalWorkflow({
    today: options.today || '2026-08-29',
    lookaheadDays: 120,
    forceFailureDemo: options.forceFailureDemo || false,
  });

  revalidatePath('/admin/festivals');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/dashboard');

  return result;
}

export async function dispatchBatchFestivalCampaignAction(options: {
  festivalName: string;
  decisions: FestivalDecisionData[];
}) {
  const supabase = await createClient();
  let dispatchedCount = 0;
  const dispatchedCustomers: string[] = [];

  for (const dec of options.decisions) {
    if (dec.should_contact) {
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('email')
          .eq('id', dec.customer_id)
          .single();

        const targetEmail = customer?.email || 'customer@sareethi.com';

        await sendEmail({
          to: targetEmail,
          subject: `✨ Sareethi Festive Collection: ${options.festivalName}`,
          customerName: dec.customer_name,
          type: 'FOLLOWUP',
          messageText: dec.personalized_message,
        });

        dispatchedCount++;
        dispatchedCustomers.push(dec.customer_name);
      } catch (err) {
        console.warn('Batch email dispatch notice:', err);
      }
    }
  }

  // Audit Log Entry for Batch Campaign Dispatch
  await supabase.from('audit_logs').insert({
    action: 'FESTIVAL_BATCH_CAMPAIGN_DISPATCHED',
    actor: 'STORE_OWNER',
    details_json: {
      festival: options.festivalName,
      total_dispatched: dispatchedCount,
      customers: dispatchedCustomers,
      timestamp: new Date().toISOString(),
    },
  });

  revalidatePath('/admin/festivals');
  return { success: true, dispatchedCount, dispatchedCustomers };
}
