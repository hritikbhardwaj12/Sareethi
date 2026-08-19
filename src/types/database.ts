export type Role = 'OWNER' | 'STAFF' | 'CUSTOMER';

export interface Profile {
  id: string;
  role_id: Role;
  full_name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type Category = 'Saree' | 'Suit' | 'Other';
export type ProductStatus = 'ACTIVE' | 'NEEDS_REVIEW' | 'DELETED';

export interface Product {
  id: string; // e.g. 'SAR-00001', 'SUIT-00001'
  catalogue_item_id?: string;
  name: string;
  category: Category;
  selling_price: number;
  cost_price?: number;
  original_price?: number;
  discount_percent: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  color?: string;
  fabric?: string;
  style?: string;
  pattern?: string;
  occasion?: string;
  size?: string;
  blouse_details?: string;
  sleeve_type?: string;
  neck_style?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  product_id: string;
  quantity: number;
  min_alert_threshold: number;
  location_rack?: string;
  updated_at: string;
}

export interface Customer {
  id: string; // e.g. 'CUST-00101'
  profile_id?: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  return_count: number;
  last_purchase_date?: string;
  avg_purchase_interval_days?: number;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  bill_number: string; // e.g. 'INV-20260820-0042'
  customer_id: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  pdf_url?: string;
  created_at: string;
}

export interface BillItem {
  id: string;
  bill_number: string;
  product_id?: string;
  product_name: string;
  captured_image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderStatus = 'ORDER_CREATED' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export interface Order {
  id: string; // e.g. 'ORD-1028'
  bill_number?: string;
  customer_id: string;
  status: OrderStatus;
  total_price: number;
  shipping_address?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Return {
  id: string;
  bill_number: string;
  customer_id: string;
  refund_amount: number;
  reason?: string;
  created_at: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  product_id: string;
  quantity: number;
  refund_subtotal: number;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Approval {
  id: string;
  workflow_id?: string;
  type: string;
  title: string;
  payload_json: Record<string, unknown>;
  risk_level: RiskLevel;
  status: ApprovalStatus;
  owner_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  workflow_id?: string;
  action: string;
  actor: 'AI_WORKER' | 'STORE_OWNER' | 'SYSTEM';
  details_json: Record<string, unknown>;
  created_at: string;
}
