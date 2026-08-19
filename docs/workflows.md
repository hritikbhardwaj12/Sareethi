# Workflow & State Machine Specifications — Sareethi

This document details the exact state transitions, flowcharts, and execution rules for all primary business workflows in **Sareethi**.

---

## 1. Catalogue Ingestion State Machine

Processes raw uploaded PDF / image / video files into structured products.

```text
[ UPLOADED ]
     │
     ▼
[ PROCESSING ] ──(Error / Unreadable)──► [ RETRY (Max 2) ] ──(Failed)──► [ RETRY_FAILED ] ──► [ HUMAN_ESCALATION ]
     │
     ▼
[ EXTRACTING ] (Vision OCR & Chunking)
     │
     ▼
[ GROUPING ] (Multi-photo Saree linking)
     │
     ▼
[ CLASSIFYING ] (Category & Attribute extraction)
     │
     ▼
[ VALIDATING ]
     │
     ├─────── Low Confidence / Duplicate Ambiguity ──────┐
     │                                                   ▼
     ▼                                           [ NEEDS_REVIEW ]
[ READY ]                                                │
     │                                                   ▼
     │                                          [ HUMAN_APPROVAL ]
     │                                                   │
     └───────────────────────┬───────────────────────────┘
                             │
                             ▼
                        [ PUBLISHED ]
```

---

## 2. Billing & Invoicing Workflow

Triggered when store owner generates a customer bill in the Admin Billing Panel.

```text
[ BILLING_STARTED ]
       │
       ▼
[ CUSTOMER_VALIDATED ] (Phone/Name record checked)
       │
       ▼
[ ITEMS_ADDED ] (Photos captured / SKU selected)
       │
       ▼
[ PRODUCTS_MATCHED ] (AI matches photo to product OR Owner manual entry)
       │
       ▼
[ TOTAL_CALCULATED ] (Deterministic backend price math)
       │
       ▼
[ BILL_GENERATED ] (Unique INV-20260820-0042 + PDF rendering)
       │
       ▼
[ ORDER_CREATED ] (ORD-1028 record added)
       │
       ▼
[ INVENTORY_UPDATED ] (Stock quantity decremented)
       │
       ▼
[ FINANCIALS_UPDATED ] (Revenue, Cost, Profit updated on Dashboard)
       │
       ▼
[ MESSAGE_GENERATED ] (Receipt notification drafted)
       │
       ▼
[ HUMAN_APPROVAL ] (Owner confirms notification send)
       │
       ▼
[ COMPLETED ] (Simulated SMS/WhatsApp log + Audit recorded)
```

---

## 3. Order Lifecycle & Delay Exception Workflow

```text
[ ORDER_CREATED ] ──► [ CONFIRMED ] ──► [ PROCESSING ] ──► [ DISPATCHED ] ──► [ IN_TRANSIT ] ──► [ DELIVERED ]
                                                                                   │
                                                                       (SLA threshold exceeded)
                                                                                   │
                                                                                   ▼
                                                                          [ DELAY_DETECTED ]
                                                                                   │
                                                                                   ▼
                                                                         [ EXCEPTION_CREATED ]
                                                                                   │
                                                                                   ▼
                                                                         [ RECOMMENDATION ]
                                                                                   │
                                                                                   ▼
                                                                         [ HUMAN_APPROVAL ]
                                                                                   │
                                                                         ┌─────────┴─────────┐
                                                                         ▼                   ▼
                                                                     (Approved)          (Rejected)
                                                                         │                   │
                                                                         ▼                   ▼
                                                                    [ RESOLVED ]     [ DISMISSED ]
```

---

## 4. Customer Return Workflow

Handles customer item return processing.

```text
[ RETURN_REQUESTED ]
       │
       ▼
[ BILL_FOUND ] (Owner enters Invoice No)
       │
       ▼
[ ITEMS_SELECTED ] (Owner checks specific returned items)
       │
       ▼
[ VALIDATION ] (Verify return item belongs to original invoice)
       │
       ▼
[ HUMAN_CONFIRMATION ] (Owner confirms return modal)
       │
       ▼
[ RETURN_CONFIRMED ]
       │
       ├──► Inventory Restocked (+Qty)
       ├──► Financials Adjusted (-Revenue, -Profit)
       ├──► Customer History Updated (+Return Count)
       ├──► Dashboard Analytics Refreshed
       └──► Audit Record Written
       │
       ▼
[ COMPLETED ]
```

---

## 5. Intentional Failure Scenario (Demo Script Specification)

For evaluation and demonstration purposes, Sareethi includes an **Intentional Failure Scenario** to prove robust error handling:

### Scenario Breakdown: Uninterpretable Page 17
1. **Trigger**: Owner uploads a catalogue containing a distorted/corrupted Page 17.
2. **Step 1 (Attempt 1)**: Worker executes `extract_catalogue` $\rightarrow$ Parsing fails due to low contrast / corrupt image data.
3. **Step 2 (Retry 1)**: Worker re-attempts parsing page 17 $\rightarrow$ Failed.
4. **Step 3 (Retry 2)**: Worker re-attempts page 17 with adjusted vision parameters $\rightarrow$ Failed.
5. **Step 4 (Safe Pause)**: Worker halts catalogue processing for Page 17, transitions step state to `RETRY_FAILED`.
6. **Step 5 (Escalation)**: Worker creates an entry in `exceptions` table and pushes a ticket to the Approval Queue:
   > *"Catalogue Ingestion Paused: Page 17 cannot be interpreted confidently after 2 retries. Human review required."*
7. **Step 6 (No Unsafe Action)**: No fake product is created. No hallucinated inventory is added. Audit log records exact failure trajectory.
