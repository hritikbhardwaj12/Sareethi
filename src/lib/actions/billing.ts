'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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
  // Simulated AI Visual Product Image Match
  return {
    matchedProductId: 'SAR-00001',
    matchedProductName: 'Pink Pochampally Ikkat Chiffon Saree With Unstitched Blouse Piece',
    matchedPrice: 1299,
    confidence: 0.96,
  };
}

export async function createBillAction(payload: CreateBillPayload): Promise<CreateBillResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const billNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const customerId = `CUST-${Math.floor(100 + Math.random() * 900)}`;

  const totalAmount = payload.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // 1. Create or Update Customer Record
  await supabase.from('customers').upsert({
    id: customerId,
    name: payload.customer_name,
    phone: payload.customer_phone,
    total_spent: totalAmount,
    total_orders: 1,
    average_order_value: totalAmount,
    last_purchase_date: new Date().toISOString(),
  });

  // 2. Create Bill Record
  await supabase.from('bills').insert({
    bill_number: billNumber,
    customer_id: customerId,
    total_amount: totalAmount,
    tax_amount: Math.round(totalAmount * 0.05),
    pdf_url: `/bills/${billNumber}.pdf`,
  });

  // 3. Create Bill Items
  for (const item of payload.items) {
    await supabase.from('bill_items').insert({
      bill_number: billNumber,
      product_id: item.product_id || 'SAR-00001',
      product_name: item.product_name,
      captured_image_url: item.captured_image_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
    });

    // Decrement stock inventory
    if (item.product_id) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single();
      
      const currentQty = inv?.quantity || 10;
      await supabase
        .from('inventory')
        .update({ quantity: Math.max(0, currentQty - item.quantity) })
        .eq('product_id', item.product_id);
    }
  }

  // 4. Create Order Record
  await supabase.from('orders').insert({
    id: orderId,
    bill_number: billNumber,
    customer_id: customerId,
    status: 'CONFIRMED',
    total_price: totalAmount,
  });

  // 5. Evaluate AI Customer Follow-Up Opportunity
  let followupGenerated = false;
  let suggestedFollowupMessage;

  if (payload.items.length >= 2 || totalAmount >= 3000) {
    followupGenerated = true;
    suggestedFollowupMessage = `Hi ${payload.customer_name}, thank you for your recent purchase at Sareethi! We have saved your preference for festive sarees and suit sets. Look out for our upcoming new collection!`;

    const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;

    await supabase.from('approvals').insert({
      id: approvalId,
      type: 'FOLLOWUP',
      title: `Customer Re-engagement Suggested: ${payload.customer_name}`,
      payload_json: {
        customer_id: customerId,
        customer_name: payload.customer_name,
        suggested_message: suggestedFollowupMessage,
        recent_total: totalAmount,
      },
      risk_level: 'LOW',
      status: 'PENDING',
    });
  }

  // 6. Audit Log Transaction
  await supabase.from('audit_logs').insert({
    action: 'BILL_GENERATED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details_json: {
      bill_number: billNumber,
      order_id: orderId,
      customer_name: payload.customer_name,
      total_amount: totalAmount,
      items_count: payload.items.length,
    },
  });

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/store');

  return {
    billNumber,
    orderId,
    customerId,
    totalAmount,
    pdfUrl: `/bills/${billNumber}.pdf`,
    followupGenerated,
    suggestedFollowupMessage,
  };
}
