'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { tool_update_inventory, tool_create_exception, tool_write_audit_log } from '@/lib/ai/tools';
import { orchestrator } from '@/lib/ai/orchestrator';

export interface ProcessReturnPayload {
  bill_number: string;
  returned_items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  reason: string;
}

export async function processReturnAction(payload: ProcessReturnPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalRefundAmount = payload.returned_items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  // 1. Fetch original bill to retrieve customer_id
  const { data: bill } = await supabase
    .from('bills')
    .select('customer_id')
    .eq('bill_number', payload.bill_number)
    .single();

  const customerId = bill?.customer_id || 'CUST-00101';

  // 2. Create Return Record
  await supabase.from('returns').insert({
    id: returnId,
    bill_number: payload.bill_number,
    customer_id: customerId,
    refund_amount: totalRefundAmount,
    reason: payload.reason,
  });

  // 3. Process Return Items & Restock Inventory via Controlled Tools
  for (const item of payload.returned_items) {
    await supabase.from('return_items').insert({
      return_id: returnId,
      product_id: item.product_id,
      quantity: item.quantity,
      refund_subtotal: item.unit_price * item.quantity,
    });

    // Restock Inventory (+Qty)
    await tool_update_inventory({
      product_id: item.product_id,
      quantity_change: item.quantity,
      reason: `Customer Return ${returnId}`,
    });
  }

  // 4. Update Customer Return History
  const { data: customer } = await supabase
    .from('customers')
    .select('return_count')
    .eq('id', customerId)
    .single();

  await supabase
    .from('customers')
    .update({
      return_count: (customer?.return_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  // 5. Write Immutable Audit Log
  await tool_write_audit_log({
    action: 'CUSTOMER_RETURN_CONFIRMED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details: {
      return_id: returnId,
      bill_number: payload.bill_number,
      customer_id: customerId,
      refund_amount: totalRefundAmount,
      items_count: payload.returned_items.length,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/store');
  revalidatePath('/admin/returns');

  return { success: true, returnId, totalRefundAmount };
}

export async function detectDelayedOrderExceptionsAction() {
  const supabase = await createClient();

  // Find in-transit delayed orders
  const delayedOrderMock = {
    order_id: 'ORD-1028',
    customer_name: 'Anita Roy',
    delay_hours: 8,
  };

  // Invoke Operations Worker to analyze delay and draft recommendation (No auto refund)
  const analysis = await orchestrator.operationsWorker.analyzeDelayedOrder(
    delayedOrderMock.order_id,
    delayedOrderMock.customer_name,
    delayedOrderMock.delay_hours
  );

  // Push exception ticket & recommendation draft to Human Approval Queue
  const exceptionResult = await tool_create_exception({
    order_id: analysis.orderId,
    delay_hours: analysis.delayHours,
    severity: analysis.severity,
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/exceptions');

  return {
    success: true,
    analysis,
    approvalId: exceptionResult.approvalId,
  };
}
