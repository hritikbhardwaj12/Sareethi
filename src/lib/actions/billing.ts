'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { tool_create_bill, tool_generate_bill_pdf, tool_create_order, tool_update_inventory, tool_create_followup, tool_write_audit_log } from '@/lib/ai/tools';

export interface BillItemPayload {
  product_id?: string;
  product_name: string;
  captured_image_url?: string;
  unit_price: number;
  quantity: number;
}

export interface CreateBillPayload {
  customer_name: string;
  customer_phone: string;
  items: BillItemPayload[];
}

export interface CreateBillResult {
  billNumber: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  pdfUrl: string;
  followupGenerated: boolean;
  suggestedFollowupMessage?: string;
}

export async function matchProductPhotoAction(photoUrl: string) {
  return {
    matchedProductId: 'SAR-00001',
    matchedProductName: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    matchedPrice: 1299,
    confidence: 0.96,
  };
}

export async function executeEndToEndBillingCascadeAction(payload: CreateBillPayload): Promise<CreateBillResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const customerId = `CUST-${Math.floor(100 + Math.random() * 900)}`;
  const totalAmount = payload.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // Step 1: Customer Record
  await supabase.from('customers').upsert({
    id: customerId,
    name: payload.customer_name,
    phone: payload.customer_phone,
    total_spent: totalAmount,
    total_orders: 1,
    average_order_value: totalAmount,
    last_purchase_date: new Date().toISOString(),
  });

  // Step 2: Bill Creation via Controlled Tool Layer
  const billRes = await tool_create_bill({ customer_id: customerId, total_amount: totalAmount });
  const pdfRes = await tool_generate_bill_pdf({ bill_number: billRes.billNumber });

  // Step 3: Insert Bill Items & Decrement Inventory via Controlled Tools
  for (const item of payload.items) {
    await supabase.from('bill_items').insert({
      bill_number: billRes.billNumber,
      product_id: item.product_id || 'SAR-00001',
      product_name: item.product_name,
      captured_image_url: item.captured_image_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
    });

    if (item.product_id) {
      await tool_update_inventory({
        product_id: item.product_id,
        quantity_change: -item.quantity,
        reason: `Physical Store Sale ${billRes.billNumber}`,
      });
    }
  }

  // Step 4: Create Order Record via Controlled Tool Layer
  const orderRes = await tool_create_order({
    customer_id: customerId,
    total_price: totalAmount,
    bill_number: billRes.billNumber,
  });

  // Step 5: Evaluate AI Follow-up Opportunity via Controlled Tool Layer
  let followupGenerated = false;
  let suggestedFollowupMessage;

  if (payload.items.length >= 2 || totalAmount >= 3000) {
    followupGenerated = true;
    suggestedFollowupMessage = `Hi ${payload.customer_name}, thank you for your purchase at Sareethi! We noticed you love festive sarees and suits. Keep an eye out for our new collection arriving next week!`;

    await tool_create_followup({
      customer_id: customerId,
      customer_name: payload.customer_name,
      suggested_message: suggestedFollowupMessage,
    });
  }

  // Step 6: Write Immutable Audit Log
  await tool_write_audit_log({
    action: 'END_TO_END_BILLING_CASCADE_COMPLETED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details: {
      bill_number: billRes.billNumber,
      order_id: orderRes.orderId,
      customer_name: payload.customer_name,
      total_amount: totalAmount,
      items_count: payload.items.length,
      ai_followup_generated: followupGenerated,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/store');
  revalidatePath('/admin/approvals');

  return {
    billNumber: billRes.billNumber,
    orderId: orderRes.orderId,
    customerId,
    totalAmount,
    pdfUrl: pdfRes.pdf_url,
    followupGenerated,
    suggestedFollowupMessage,
  };
}
