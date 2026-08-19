'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function processApprovalAction(approvalId: string, decision: 'APPROVED' | 'EDITED' | 'REJECTED', notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update Approval Record
  const { error } = await supabase
    .from('approvals')
    .update({
      status: decision,
      owner_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approvalId);

  if (error) {
    throw new Error(`Failed to process approval: ${error.message}`);
  }

  // 2. Audit Log Entry
  await supabase.from('audit_logs').insert({
    action: `HUMAN_APPROVAL_${decision}`,
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details_json: { approval_id: approvalId, decision, notes },
  });

  revalidatePath('/admin/approvals');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
