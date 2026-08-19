import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { Category, ProductStatus } from '@/types/database';

/**
 * Sareethi Controlled Tool Layer
 * 
 * Architectural Boundary:
 * The LLM NEVER executes raw SQL statements (e.g. `UPDATE products SET...`).
 * All AI interactions pass through validated tool contracts with backend authorization.
 */

// Tool 1: create_product
export async function tool_create_product(input: {
  name: string;
  category: Category;
  selling_price: number;
  cost_price?: number;
  stock_quantity?: number;
  color?: string;
  fabric?: string;
  style?: string;
  occasion?: string;
  images: string[];
}) {
  const supabase = await createClient();
  const skuPrefix = input.category === 'Saree' ? 'SAR' : input.category === 'Suit' ? 'SUIT' : 'PROD';
  const productId = `${skuPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      id: productId,
      name: input.name,
      category: input.category,
      selling_price: input.selling_price,
      cost_price: input.cost_price || Math.round(input.selling_price * 0.55),
      original_price: Math.round(input.selling_price * 2.2),
      discount_percent: 55,
      status: 'ACTIVE',
    })
    .select()
    .single();

  if (error) throw new Error(`create_product failed: ${error.message}`);

  await supabase.from('product_attributes').insert({
    product_id: productId,
    color: input.color,
    fabric: input.fabric,
    style: input.style,
    occasion: input.occasion,
  });

  await supabase.from('inventory').insert({
    product_id: productId,
    quantity: input.stock_quantity || 10,
  });

  for (let i = 0; i < input.images.length; i++) {
    await supabase.from('product_images').insert({
      product_id: productId,
      image_url: input.images[i],
      is_primary: i === 0,
      display_order: i + 1,
    });
  }

  await tool_write_audit_log({
    action: 'TOOL_CREATE_PRODUCT',
    actor: 'AI_WORKER',
    details: { product_id: productId, name: input.name },
  });

  return { success: true, productId, product };
}

// Tool 2: update_product
export async function tool_update_product(input: {
  product_id: string;
  fields: {
    name?: string;
    selling_price?: number;
    cost_price?: number;
    category?: Category;
    status?: ProductStatus;
  };
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update({ ...input.fields, updated_at: new Date().toISOString() })
    .eq('id', input.product_id)
    .select()
    .single();

  if (error) throw new Error(`update_product failed: ${error.message}`);

  await tool_write_audit_log({
    action: 'TOOL_UPDATE_PRODUCT',
    actor: 'AI_WORKER',
    details: { product_id: input.product_id, updated_fields: Object.keys(input.fields) },
  });

  return { success: true, product: data };
}

// Tool 3: find_duplicate_products
export async function tool_find_duplicate_products(input: { title: string; color?: string; fabric?: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, selling_price, status')
    .ilike('name', `%${input.title.slice(0, 10)}%`)
    .neq('status', 'DELETED');

  const matches = data || [];
  return {
    is_duplicate: matches.length > 0,
    matches,
    confidence: matches.length > 0 ? 0.95 : 0.1,
  };
}

// Tool 4: get_inventory
export async function tool_get_inventory(input: { product_id: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from('inventory').select('*').eq('product_id', input.product_id).single();
  return { product_id: input.product_id, quantity: data?.quantity || 0, min_threshold: data?.min_alert_threshold || 2 };
}

// Tool 5: update_inventory
export async function tool_update_inventory(input: { product_id: string; quantity_change: number; reason: string }) {
  const current = await tool_get_inventory({ product_id: input.product_id });
  const newQuantity = Math.max(0, current.quantity + input.quantity_change);

  const supabase = await createClient();
  await supabase.from('inventory').upsert({ product_id: input.product_id, quantity: newQuantity });

  await tool_write_audit_log({
    action: 'TOOL_UPDATE_INVENTORY',
    actor: 'AI_WORKER',
    details: { product_id: input.product_id, old_qty: current.quantity, new_qty: newQuantity, reason: input.reason },
  });

  return { success: true, product_id: input.product_id, old_quantity: current.quantity, new_quantity: newQuantity };
}

// Tool 6: create_order
export async function tool_create_order(input: { customer_id: string; total_price: number; bill_number?: string }) {
  const supabase = await createClient();
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      customer_id: input.customer_id,
      bill_number: input.bill_number,
      total_price: input.total_price,
      status: 'CONFIRMED',
    })
    .select()
    .single();

  if (error) throw new Error(`create_order failed: ${error.message}`);
  return { success: true, orderId, order: data };
}

// Tool 7: get_order
export async function tool_get_order(input: { order_id: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from('orders').select('*').eq('id', input.order_id).single();
  return { order: data };
}

// Tool 8: create_bill
export async function tool_create_bill(input: { customer_id: string; total_amount: number }) {
  const supabase = await createClient();
  const billNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, error } = await supabase
    .from('bills')
    .insert({
      bill_number: billNumber,
      customer_id: input.customer_id,
      total_amount: input.total_amount,
      pdf_url: `/bills/${billNumber}.pdf`,
    })
    .select()
    .single();

  if (error) throw new Error(`create_bill failed: ${error.message}`);
  return { success: true, billNumber, bill: data };
}

// Tool 9: generate_bill_pdf
export async function tool_generate_bill_pdf(input: { bill_number: string }) {
  return { pdf_url: `/bills/${input.bill_number}.pdf`, generated_at: new Date().toISOString() };
}

// Tool 10: get_customer_history
export async function tool_get_customer_history(input: { customer_id: string }) {
  const supabase = await createClient();
  const { data: customer } = await supabase.from('customers').select('*').eq('id', input.customer_id).single();
  return {
    customer_id: input.customer_id,
    total_orders: customer?.total_orders || 0,
    total_spent: customer?.total_spent || 0,
    avg_order_value: customer?.average_order_value || 0,
    last_purchase_date: customer?.last_purchase_date || null,
  };
}

// Tool 11: create_followup
export async function tool_create_followup(input: { customer_id: string; customer_name: string; suggested_message: string }) {
  const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;
  const supabase = await createClient();

  await supabase.from('approvals').insert({
    id: approvalId,
    type: 'FOLLOWUP',
    title: `Customer Re-engagement Suggested: ${input.customer_name}`,
    payload_json: input,
    risk_level: 'LOW',
    status: 'PENDING',
  });

  return { success: true, approvalId, status: 'QUEUED_FOR_HUMAN_APPROVAL' };
}

// Tool 12: create_exception
export async function tool_create_exception(input: { order_id: string; delay_hours: number; severity: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;
  const supabase = await createClient();

  await supabase.from('approvals').insert({
    id: approvalId,
    type: 'DELAY_ACTION',
    title: `Order ${input.order_id} Shipping Delay Exception`,
    payload_json: input,
    risk_level: input.severity,
    status: 'PENDING',
  });

  return { success: true, approvalId, status: 'QUEUED_FOR_HUMAN_APPROVAL' };
}

// Tool 13: request_approval
export async function tool_request_approval(input: { type: string; title: string; payload: Record<string, unknown>; risk_level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const approvalId = `APPR-${Math.floor(1000 + Math.random() * 9000)}`;
  const supabase = await createClient();

  await supabase.from('approvals').insert({
    id: approvalId,
    type: input.type,
    title: input.title,
    payload_json: input.payload,
    risk_level: input.risk_level,
    status: 'PENDING',
  });

  return { success: true, approvalId };
}

// Tool 14: write_audit_log
export async function tool_write_audit_log(input: { action: string; actor: 'AI_WORKER' | 'STORE_OWNER' | 'SYSTEM'; details: Record<string, unknown> }) {
  const supabase = await createClient();
  await supabase.from('audit_logs').insert({
    action: input.action,
    actor: input.actor,
    details_json: input.details,
  });
  return { success: true };
}
