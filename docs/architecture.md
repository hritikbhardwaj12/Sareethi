# System Architecture & Database Specification — Sareethi

## 1. System Architecture Diagram

```text
                                 ┌────────────────────────┐
                                 │  CUSTOMER STOREFRONT   │
                                 │  Mobile React Web App  │
                                 └───────────┬────────────┘
                                             │
                                             ▼
                                 ┌────────────────────────┐
                                 │   ADMIN CONTROL PANEL  │
                                 │ Dashboard/Store/Bill   │
                                 └───────────┬────────────┘
                                             │ REST / API
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FASTAPI BACKEND CORE                                 │
│                                                                                        │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────────────────┐  │
│  │   Product Manager    │   │    Billing Engine    │   │       Order Engine         │  │
│  └──────────┬───────────┘   └──────────┬───────────┘   └─────────────┬──────────────┘  │
│             │                          │                             │                 │
│  ┌──────────┴───────────┐   ┌──────────┴───────────┐   ┌─────────────┴──────────────┐  │
│  │  Deterministic IDs   │   │ PDF Billing & Math   │   │  Inventory & Accounting    │  │
│  └──────────────────────┘   └──────────────────────┘   └────────────────────────────┘  │
└────────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ Controlled Tools
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SAREETHI AI WORKER                                    │
│                                                                                        │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────────────────┐  │
│  │ Vision & Extraction  │   │  Duplicate Detection │   │   Customer Intelligence    │  │
│  └──────────────────────┘   └──────────────────────┘   └────────────────────────────┘  │
└────────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ SQL & State
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               RELATIONAL DATABASE CORE                                 │
│    products | product_images | orders | bills | customers | audit_logs | exceptions    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LLM vs Backend Separation of Responsibilities

| Responsibility Domain | LLM / AI Worker Handle | Backend Systems Handle |
| :--- | :--- | :--- |
| **Products & Catalogues** | Vision OCR, Garment segmentation, Image visual grouping, Semantic attribute extraction, Description drafting. | Product SKU assignment (`SAR-00001`), DB persistence, Validation, Image storage routing. |
| **Pricing & Financials** | Printed price text extraction from catalogue images. | Tax calculation, Discount subtraction, Profit computation, Revenue ledger updates. |
| **Stock & Inventory** | Stock alert reasoning based on sales velocity. | Absolute stock quantity increments/decrements upon confirmed order or return events. |
| **Billing & Invoicing** | Product photo visual match during bill capture. | Bill PDF rendering, Invoice sequence counter (`INV-20260820-0042`), Total math. |
| **Orders & Shipping** | SLA delay severity assessment, Customer message drafting. | Order status transitions, Timestamp tracking, Exception ticket creation. |
| **Governance & Safety** | Pushing recommendations to queue. | Authorization policies, Level 3 operation blocking, Audit record immutability. |

---

## 3. Core Relational Database Schemas

### `products`
```sql
CREATE TABLE products (
    id VARCHAR(32) PRIMARY KEY, -- e.g., 'SAR-00001', 'SUIT-00001'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Saree', 'Suit', 'Other'
    selling_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2), -- Private Admin Field
    original_price DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    stock_quantity INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'NEEDS_REVIEW', 'DELETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `product_attributes`
```sql
CREATE TABLE product_attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id VARCHAR(32) REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(64),
    fabric VARCHAR(64),
    style VARCHAR(64),
    pattern VARCHAR(64),
    occasion VARCHAR(64),
    size VARCHAR(32),
    blouse_details VARCHAR(128),
    sleeve_type VARCHAR(64),
    neck_style VARCHAR(64),
    raw_extracted_json TEXT
);
```

### `product_images`
```sql
CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id VARCHAR(32) REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);
```

### `customers`
```sql
CREATE TABLE customers (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'CUST-00104'
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL UNIQUE,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    average_order_value DECIMAL(10, 2) DEFAULT 0.00,
    return_count INT DEFAULT 0,
    last_purchase_date TIMESTAMP,
    avg_purchase_interval_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `bills` & `orders`
```sql
CREATE TABLE bills (
    bill_number VARCHAR(64) PRIMARY KEY, -- e.g. 'INV-20260820-0042'
    customer_id VARCHAR(32) REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    pdf_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY, -- e.g. 'ORD-1028'
    bill_number VARCHAR(64) REFERENCES bills(bill_number),
    customer_id VARCHAR(32) REFERENCES customers(id),
    status VARCHAR(32) NOT NULL, -- 'ORDER_CREATED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `approval_queue` & `audit_logs`
```sql
CREATE TABLE approval_queue (
    id VARCHAR(32) PRIMARY KEY,
    type VARCHAR(64) NOT NULL, -- 'FOLLOWUP', 'CLASSIFICATION_REVIEW', 'DELAY_ACTION'
    title VARCHAR(255) NOT NULL,
    payload_json TEXT NOT NULL,
    risk_level VARCHAR(16) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'EDITED', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id VARCHAR(32) PRIMARY KEY,
    workflow_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    actor VARCHAR(64) NOT NULL, -- 'AI_WORKER', 'STORE_OWNER', 'SYSTEM'
    details_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
