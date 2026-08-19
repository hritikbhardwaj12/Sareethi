# TOOLS.md — Sareethi Tool Contracts & Permission Registry

This document catalogues all controlled tools available to the **Sareethi AI Worker**, specifying their schemas, permissions, deterministic boundaries, and error handling policies.

---

## 1. Tool Architecture Principles

1. **Controlled Interfaces**: The LLM does not execute raw database queries or direct HTTP requests. All actions are routed through validated tool definitions.
2. **Deterministic Computation**: Tools performing arithmetic (tax, total, margin, inventory subtraction) enforce strict backend logic.
3. **Permission Enforcement**: Level 3 actions (refunds, hard deletes) are explicitly prohibited at the tool layer.

---

## 2. Catalog of Controlled Tools

### A. Catalogue & Product Tools

#### 1. `extract_catalogue`
- **Purpose**: Parse raw PDF, image, or video catalogue files into visual and text chunks.
- **Input**: `{ file_path: string, mime_type: string }`
- **Output**: `{ pages: Array<{ page_num: int, image_urls: string[], text_snippets: string[] }> }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 2. `detect_products`
- **Purpose**: Identify individual garment items from extracted pages.
- **Input**: `{ page_chunks: object[] }`
- **Output**: `{ detected_items: Array<{ item_temp_id: string, bounding_box: object, raw_text: string }> }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 3. `group_product_images`
- **Purpose**: Group multiple images belonging to the exact same product (front view, close-up border, back view).
- **Input**: `{ image_urls: string[] }`
- **Output**: `{ product_groups: Array<{ primary_image: string, gallery: string[], confidence: float }> }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 4. `detect_duplicates`
- **Purpose**: Check database for exact or visually similar existing products.
- **Input**: `{ image_features: float[], title: string }`
- **Output**: `{ is_duplicate: boolean, existing_product_id: string | null, similarity_score: float }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 5. `extract_attributes`
- **Purpose**: Extract category, fabric, color, style, pattern, occasion, size, blouse details.
- **Input**: `{ text: string, image_url: string }`
- **Output**: `{ category: "Saree"|"Suit"|"Other", attributes: Record<string, string>, evidence_found: boolean }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 6. `create_product`
- **Purpose**: Deterministically generate product ID (`SAR-00001`), calculate selling price fallback, and persist product.
- **Input**: `{ category: string, attributes: object, catalogue_price?: number, owner_fallback_price: number, cost_price?: number, initial_stock?: number, gallery: string[] }`
- **Output**: `{ product_id: string, status: "PUBLISHED" | "NEEDS_REVIEW" }`
- **Autonomy Tier**: Level 1 (Backend Deterministic Write)

---

### B. Billing & Return Tools

#### 7. `create_bill`
- **Purpose**: Generate structured invoice, compute totals deterministically, create order record.
- **Input**: `{ customer_name: string, customer_phone: string, items: Array<{ product_id: string, price: number, quantity: int }> }`
- **Output**: `{ bill_number: string, order_id: string, total_amount: number, pdf_url: string }`
- **Autonomy Tier**: Level 1 (Deterministic Write)

#### 8. `generate_bill_pdf`
- **Purpose**: Render bill PDF document with store header, itemized breakdown, tax, and total.
- **Input**: `{ bill_data: object }`
- **Output**: `{ pdf_file_path: string }`
- **Autonomy Tier**: Level 1 (Autonomous)

#### 9. `process_return`
- **Purpose**: Process item returns, adjust inventory up, adjust store revenue/profit down, update customer history.
- **Input**: `{ bill_number: string, returned_item_ids: string[], reason: string }`
- **Output**: `{ return_id: string, refunded_amount: number, updated_stock: object }`
- **Autonomy Tier**: Level 2 (Requires Owner Confirmation in UI)

---

### C. Customer & Workflow Tools

#### 10. `detect_delayed_order`
- **Purpose**: Monitor order tracking timestamps against SLA.
- **Input**: `{ check_interval_hours: int }`
- **Output**: `{ delayed_orders: Array<{ order_id: string, delay_duration_hrs: float, severity: "LOW"|"MEDIUM"|"HIGH" }> }`
- **Autonomy Tier**: Level 1 (Autonomous Monitoring)

#### 11. `generate_followup_recommendation`
- **Purpose**: Identify customers exceeding average purchase intervals and draft re-engagement messages.
- **Input**: `{ customer_id: string }`
- **Output**: `{ recommendation_id: string, draft_message: string, evidence: object }`
- **Autonomy Tier**: Level 2 (Requires Owner Approval)

#### 12. `request_human_approval`
- **Purpose**: Push recommendation or exception item to Admin Dashboard Approval Queue.
- **Input**: `{ type: string, summary: string, payload: object, risk_level: string }`
- **Output**: `{ queue_item_id: string, status: "PENDING" }`
- **Autonomy Tier**: Level 1 (Autonomous Escalation)

#### 13. `create_audit_log`
- **Purpose**: Write audit log entry into system ledger.
- **Input**: `{ workflow_id: string, action: string, performed_by: string, details: object }`
- **Output**: `{ audit_id: string, timestamp: string }`
- **Autonomy Tier**: Level 1 (Autonomous Logging)
