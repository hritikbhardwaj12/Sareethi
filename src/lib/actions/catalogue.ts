'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Category, ProductStatus } from '@/types/database';

export interface CatalogueProcessResult {
  workflowId: string;
  fileName: string;
  fileType: string;
  extractedProducts: {
    tempId: string;
    suggestedSku: string;
    name: string;
    category: Category;
    extractedPrice?: number;
    fallbackPriceUsed: boolean;
    finalPrice: number;
    confidence: number;
    status: ProductStatus;
    images: string[];
    attributes: {
      color: string;
      fabric: string;
      style: string;
      occasion: string;
      blouse: string;
    };
  }[];
}

export async function processCatalogueUploadAction(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<CatalogueProcessResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const workflowId = `WF-CAT-${Date.now().toString().slice(-6)}`;

  // 1. Record Ingestion Workflow
  await supabase.from('ai_workflows').insert({
    id: workflowId,
    workflow_type: 'CATALOGUE_INGESTION',
    current_step: 'PROCESSING',
    status: 'RUNNING',
    payload_json: { file_name: fileName, file_type: fileType, file_size: fileSize },
  });

  // 2. Audit Log Start
  await supabase.from('audit_logs').insert({
    workflow_id: workflowId,
    action: 'CATALOGUE_INGESTION_STARTED',
    actor: user ? 'STORE_OWNER' : 'STORE_OWNER',
    details_json: { file_name: fileName, file_type: fileType },
  });

  // 3. Simulated AI Content Extraction, Product Candidate Detection & Image Grouping
  const extractedProducts = [
    {
      tempId: 'CAND-01',
      suggestedSku: 'SAR-00005',
      name: 'Emerald Green Banarsi Silk Saree With Gold Zari Weave',
      category: 'Saree' as Category,
      extractedPrice: 1599,
      fallbackPriceUsed: false,
      finalPrice: 1599,
      confidence: 0.94,
      status: 'ACTIVE' as ProductStatus,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      ],
      attributes: {
        color: 'Green',
        fabric: 'Banarsi Silk',
        style: 'Zari Weave',
        occasion: 'Festive',
        blouse: 'Unstitched Blouse Piece Included',
      },
    },
    {
      tempId: 'CAND-02',
      suggestedSku: 'SUIT-00003',
      name: 'Peach Printed Cotton Anarkali Suit Set With Dupatta',
      category: 'Suit' as Category,
      extractedPrice: undefined, // Price missing in catalogue -> fallback applied
      fallbackPriceUsed: true,
      finalPrice: 1499, // Owner fallback default
      confidence: 0.91,
      status: 'ACTIVE' as ProductStatus,
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      ],
      attributes: {
        color: 'Peach',
        fabric: 'Cotton',
        style: 'Anarkali',
        occasion: 'Casual',
        blouse: 'Matching Dupatta Included',
      },
    },
    {
      tempId: 'CAND-03',
      suggestedSku: 'SAR-00006',
      name: 'Deep Maroon Velvet Embroidered Saree',
      category: 'Saree' as Category,
      extractedPrice: 2499,
      fallbackPriceUsed: false,
      finalPrice: 2499,
      confidence: 0.78, // Low confidence -> sent to Human Review Queue
      status: 'NEEDS_REVIEW' as ProductStatus,
      images: [
        'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      ],
      attributes: {
        color: 'Maroon',
        fabric: 'Velvet',
        style: 'Embroidered',
        occasion: 'Wedding',
        blouse: 'Embellished',
      },
    },
  ];

  // 4. Auto-publish high-confidence products & send low-confidence to Approval Queue
  for (const item of extractedProducts) {
    if (item.status === 'NEEDS_REVIEW') {
      await supabase.from('approvals').insert({
        id: `APPR-${Math.floor(1000 + Math.random() * 9000)}`,
        workflow_id: workflowId,
        type: 'CLASSIFICATION_REVIEW',
        title: `Uncertain Catalogue Product: ${item.name}`,
        payload_json: item,
        risk_level: 'MEDIUM',
        status: 'PENDING',
      });
    } else {
      // Create Product in DB
      await supabase.from('products').insert({
        id: item.suggestedSku,
        name: item.name,
        category: item.category,
        selling_price: item.finalPrice,
        cost_price: Math.round(item.finalPrice * 0.55),
        original_price: Math.round(item.finalPrice * 2.2),
        discount_percent: 55,
        status: 'ACTIVE',
      });

      await supabase.from('product_attributes').insert({
        product_id: item.suggestedSku,
        color: item.attributes.color,
        fabric: item.attributes.fabric,
        style: item.attributes.style,
        occasion: item.attributes.occasion,
        blouse_details: item.attributes.blouse,
      });

      await supabase.from('inventory').insert({
        product_id: item.suggestedSku,
        quantity: 10,
        min_alert_threshold: 2,
      });

      for (let i = 0; i < item.images.length; i++) {
        await supabase.from('product_images').insert({
          product_id: item.suggestedSku,
          image_url: item.images[i],
          is_primary: i === 0,
          display_order: i + 1,
        });
      }
    }
  }

  // 5. Update Workflow State to COMPLETED
  await supabase
    .from('ai_workflows')
    .update({ current_step: 'PUBLISHED', status: 'COMPLETED', updated_at: new Date().toISOString() })
    .eq('id', workflowId);

  revalidatePath('/admin/store');
  revalidatePath('/products');

  return {
    workflowId,
    fileName,
    fileType,
    extractedProducts,
  };
}
