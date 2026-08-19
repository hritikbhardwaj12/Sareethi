'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Category, ProductStatus } from '@/types/database';

export interface UpdateProductPayload {
  id: string;
  name: string;
  category: Category;
  selling_price: number;
  cost_price?: number;
  stock_quantity: number;
  color?: string;
  fabric?: string;
  style?: string;
  occasion?: string;
  description?: string;
}

export async function updateProductAction(payload: UpdateProductPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update main product table
  const { error: productError } = await supabase
    .from('products')
    .update({
      name: payload.name,
      category: payload.category,
      selling_price: payload.selling_price,
      cost_price: payload.cost_price,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);

  if (productError) {
    throw new Error(`Failed to update product: ${productError.message}`);
  }

  // 2. Update attributes
  await supabase
    .from('product_attributes')
    .upsert({
      product_id: payload.id,
      color: payload.color,
      fabric: payload.fabric,
      style: payload.style,
      occasion: payload.occasion,
      updated_at: new Date().toISOString(),
    });

  // 3. Update inventory quantity
  await supabase
    .from('inventory')
    .upsert({
      product_id: payload.id,
      quantity: payload.stock_quantity,
      updated_at: new Date().toISOString(),
    });

  // 4. Create Audit Log
  await supabase.from('audit_logs').insert({
    action: 'PRODUCT_EDITED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details_json: {
      product_id: payload.id,
      name: payload.name,
      selling_price: payload.selling_price,
      cost_price: payload.cost_price,
      stock_quantity: payload.stock_quantity,
    },
  });

  revalidatePath('/admin/store');
  revalidatePath('/products');
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Perform Soft Delete: status = 'DELETED'
  const { error } = await supabase
    .from('products')
    .update({
      status: 'DELETED' as ProductStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    throw new Error(`Soft delete failed: ${error.message}`);
  }

  // Audit Log Entry
  await supabase.from('audit_logs').insert({
    action: 'PRODUCT_SOFT_DELETED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details_json: {
      product_id: productId,
      previous_status: 'ACTIVE',
      new_status: 'DELETED',
    },
  });

  revalidatePath('/admin/store');
  revalidatePath('/products');
  return { success: true };
}
