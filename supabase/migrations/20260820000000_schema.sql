-- Sareethi Database Schema Migration Script
-- Version: 20260820000000

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(32) PRIMARY KEY, -- 'OWNER', 'STAFF', 'CUSTOMER'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, description) VALUES 
('OWNER', 'Shop Owner / Business Admin'),
('STAFF', 'Store Assistant'),
('CUSTOMER', 'Storefront Retail Customer')
ON CONFLICT (id) DO NOTHING;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Links to auth.users.id
    role_id VARCHAR(32) NOT NULL REFERENCES roles(id) DEFAULT 'CUSTOMER',
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) UNIQUE,
    email VARCHAR(128),
    avatar_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catalogue Uploads Table
CREATE TABLE IF NOT EXISTS catalogue_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    file_type VARCHAR(32) NOT NULL, -- 'pdf', 'image', 'video'
    file_size INT,
    status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED', -- 'UPLOADED', 'PROCESSING', 'COMPLETED', 'NEEDS_REVIEW', 'FAILED'
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Catalogue Items Table (Detected Chunks)
CREATE TABLE IF NOT EXISTS catalogue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalogue_id UUID NOT NULL REFERENCES catalogue_uploads(id) ON DELETE CASCADE,
    page_number INT,
    image_url VARCHAR(512) NOT NULL,
    detected_category VARCHAR(64),
    raw_extracted_text TEXT,
    confidence_score DECIMAL(5, 4),
    status VARCHAR(32) DEFAULT 'EXTRACTED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY, -- Deterministic backend SKU e.g. 'SAR-00001', 'SUIT-00001'
    catalogue_item_id UUID REFERENCES catalogue_items(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Saree', 'Suit', 'Other'
    selling_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2), -- Private Admin Field
    original_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'NEEDS_REVIEW', 'DELETED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Product Images Table (Multi-photo Gallery)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(32) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Product Attributes Table
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(32) UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(64),
    fabric VARCHAR(64),
    style VARCHAR(64),
    pattern VARCHAR(64),
    occasion VARCHAR(64),
    size VARCHAR(32),
    blouse_details VARCHAR(128),
    sleeve_type VARCHAR(64),
    neck_style VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    product_id VARCHAR(32) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    min_alert_threshold INT DEFAULT 2,
    location_rack VARCHAR(64),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'CUST-00101'
    profile_id UUID REFERENCES profiles(id),
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    average_order_value DECIMAL(10, 2) DEFAULT 0.00,
    return_count INT DEFAULT 0,
    last_purchase_date TIMESTAMPTZ,
    avg_purchase_interval_days INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Bills Table
CREATE TABLE IF NOT EXISTS bills (
    bill_number VARCHAR(64) PRIMARY KEY, -- e.g. 'INV-20260820-0042'
    customer_id VARCHAR(32) NOT NULL REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    pdf_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(64) NOT NULL REFERENCES bills(bill_number) ON DELETE CASCADE,
    product_id VARCHAR(32) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    captured_image_url VARCHAR(512),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- 12. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'ORD-1028'
    bill_number VARCHAR(64) REFERENCES bills(bill_number),
    customer_id VARCHAR(32) NOT NULL REFERENCES customers(id),
    status VARCHAR(32) NOT NULL DEFAULT 'ORDER_CREATED', -- 'ORDER_CREATED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'
    total_price DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    tracking_number VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(32) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- 14. Returns Table
CREATE TABLE IF NOT EXISTS returns (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'RET-0012'
    bill_number VARCHAR(64) NOT NULL REFERENCES bills(bill_number),
    customer_id VARCHAR(32) NOT NULL REFERENCES customers(id),
    refund_amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Return Items Table
CREATE TABLE IF NOT EXISTS return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id VARCHAR(32) NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    product_id VARCHAR(32) NOT NULL REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    refund_subtotal DECIMAL(10, 2) NOT NULL
);

-- 16. AI Workflows Table
CREATE TABLE IF NOT EXISTS ai_workflows (
    id VARCHAR(64) PRIMARY KEY, -- e.g. 'WF-CAT-20260820-0001'
    workflow_type VARCHAR(64) NOT NULL, -- 'CATALOGUE_INGESTION', 'DELAYED_ORDER_CHECK'
    current_step VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING', -- 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED'
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AI Tasks Table
CREATE TABLE IF NOT EXISTS ai_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(64) NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
    task_name VARCHAR(128) NOT NULL,
    retry_count INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    output_json JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Approvals Table (Human Approval Queue)
CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'APPR-00101'
    workflow_id VARCHAR(64) REFERENCES ai_workflows(id),
    type VARCHAR(64) NOT NULL, -- 'FOLLOWUP', 'CLASSIFICATION_REVIEW', 'DELAY_ACTION'
    title VARCHAR(255) NOT NULL,
    payload_json JSONB NOT NULL,
    risk_level VARCHAR(16) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'EDITED', 'REJECTED'
    owner_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Followups Table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(32) NOT NULL REFERENCES customers(id),
    approval_id VARCHAR(32) REFERENCES approvals(id),
    suggested_message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'RECOMMENDED', -- 'RECOMMENDED', 'APPROVED', 'SENT', 'REJECTED'
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    actor VARCHAR(64) NOT NULL, -- 'AI_WORKER', 'STORE_OWNER', 'SYSTEM'
    details_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'INFO', -- 'INFO', 'WARNING', 'EXCEPTION'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
