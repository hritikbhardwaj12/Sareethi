# Product Specification — Sareethi

## 1. Product Overview & Core Vision
Sareethi is an AI-operated digital retail operating system designed specifically for local women's fashion retailers selling sarees, suits, and ladies' clothing. 

Instead of forcing a non-technical shop owner to manually create and manage products, upload spreadsheets, and navigate complex e-commerce backends, Sareethi processes raw catalogues (PDFs, images, videos), extracts products and prices, maintains inventory, handles billing, tracks orders, detects exceptions, generates customer follow-ups, and manages customer returns through an integrated AI Worker and deterministic backend core.

---

## 2. Main Users & Personas

### 2.1 Customer Persona
- **Platform**: Mobile-first Web Storefront.
- **Goal**: Seamlessly browse sarees, suits, view image galleries, search by fabric/color/occasion, add items to cart, and place orders.
- **Experience**: Clean, fast, visual fashion shopping. The AI Worker is completely transparent and invisible to the customer.

### 2.2 Shop Owner / Admin Persona
- **Platform**: Unified 3-Section Admin Control Panel (**Dashboard**, **Store**, **Billing**).
- **Goal**: Oversee retail operations, upload catalogues, create bills, review AI recommendations, and retain final authority over financial and sensitive business decisions.

---

## 3. Detailed Module Specifications

### 3.1 Mobile-First Customer Storefront
- **Mobile Priority**: UI layouts, navigation bars, touch targets, and image cards optimized for smartphone screens.
- **Category Browsing**: Dedicated sections for `Sarees`, `Suits`, `New Arrivals`, and extensible future categories (Lehengas, Kurtis).
- **Attribute Filtering**: Filter products by color, fabric, pattern, style, occasion, size, blouse detail, price range.
- **Product Detail Page (PDP)**: High-resolution multi-image gallery, product name, deterministic SKU, price, original price, discount tag, size guide, fabric details, stock status, delivery info, "Add to Cart" CTA.

### 3.2 Catalogue Ingestion & Product Extraction Engine
- **Input Formats**: PDF catalogues, loose images, video clips. No Excel/CSV requirement.
- **Multi-Image Grouping**: Recognizes when multiple photos (front, back, border close-up) belong to the same saree/suit product and links them to one PDP gallery.
- **Duplicate Detection**: Distinguishes exact duplicate images, multi-angle photos of the same item, and visually similar distinct products. Low-confidence cases are sent to Human Approval.
- **Attribute Extraction**: Extracts color, fabric, pattern, style, occasion, blouse details. If catalogue lacks evidence, sets attribute to `Unknown` (no hallucination).
- **Pricing Logic**: Extracts printed catalogue price. If missing, applies owner fallback default price.
- **Deterministic Product IDs**: Backend auto-assigns sequential database IDs (`SAR-00001`, `SUIT-00001`).

### 3.3 Admin Panel

#### A. Admin Dashboard
- **Real-Time Overview**: Today's Sales, Orders Count, Items Sold, Returns Count, New Customers, Gross Profit, Pending Approval Actions.
- **Sales Graphs**: Interactive daily, monthly, and yearly revenue/profit curves.
- **Business Analytics**: Average Order Value (AOV), Return Rate %, Best-Selling Categories/Products, Low-Stock Warnings, Repeat Customer Velocity, Pending Follow-ups.

#### B. Admin Store Management
- **In-Context Admin Controls**: The owner browses the exact storefront interface customers see, but overlaid with quick `[ EDIT ]` and `[ DELETE ]` management controls.
- **Editable Attributes**: Name, category, gallery images, selling price, cost price, stock count, fabric, color, style, description.
- **Admin-Only Field Privacy**: Cost price, stock adjustment controls, AI confidence scores, and audit tags are strictly hidden from customer view.
- **Soft Deletion**: Deleting a product sets `status = DELETED` to preserve order and audit history.

#### C. Billing & Invoicing Panel
- **Quick Bill Creation**: Enters Customer Name, Phone Number, and captures product photos.
- **AI Photo Matching**: AI identifies existing product match (`SAR-00021`) and populates details and price automatically.
- **Deterministic Bill PDF**: Generates branded PDF invoice containing Store Name, Bill No (`INV-20260820-0042`), Timestamp, Customer details, Itemized breakdown, Tax, and Total.
- **Simulated Communication**: Prepares SMS/WhatsApp receipt notification for owner approval. Clearly labeled as `Simulated` until real SMS APIs are connected.

### 3.4 Order & Returns Management
- **Order Lifecycle**: `ORDER_CREATED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `DISPATCHED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED`.
- **Delayed Order AI Worker**: Detects shipping SLA delays $\rightarrow$ Logs exception $\rightarrow$ Recommends customer update draft $\rightarrow$ Requests Owner Approval. (Strict rule: No automated refunds).
- **Return Workflow**: Owner inputs Bill No $\rightarrow$ Selects returned items $\rightarrow$ Confirms Return $\rightarrow$ Inventory auto-incremented $\rightarrow$ Financials adjusted $\rightarrow$ Customer history updated $\rightarrow$ Audit entry logged.

### 3.5 Customer Intelligence & Re-Engagement Worker
- **Behavior Analysis**: Calculates purchase frequency, total lifetime value, preferred garment styles, average interval between buys, return rate.
- **Follow-up Engine**: Identifies re-engagement opportunities (e.g. customer inactive 45 days vs 30-day average) and drafts personalized outreach messages for owner approval.

### 3.6 Human Approval Queue & Audit System
- **Approval Queue**: Dedicated UI section presenting Level 2 AI recommendations with `[ APPROVE ]`, `[ EDIT ]`, and `[ REJECT ]` actions.
- **Audit Logging**: Every system event (product created, price edited, bill issued, item returned, message sent) records timestamp, actor (AI/Owner), payload summary, and decision.
