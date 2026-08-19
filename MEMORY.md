# MEMORY.md — Sareethi Memory Strategy & State Architecture

This document defines the dual-memory architecture for **Sareethi**: separating short-term **Operational Workflow State** from long-term **Structured Business Memory**.

---

## 1. Dual Memory Concept

```text
                               SAREETHI MEMORY SYSTEM
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
    OPERATIONAL WORKFLOW STATE                       STRUCTURED BUSINESS MEMORY
    (Ephemeral, Active Context)                      (Persistent SQL Storage)
    - Catalogue Chunk Queue                          - Customer Order & Spend History
    - Pending Human Approvals                        - Product Attribute Graph
    - Active Billing Drafts                          - Financial Accounting Ledger
    - Execution State & Retries                      - Audit & Approval Logs
```

---

## 2. Operational Workflow State (Short-Term Memory)

- **Purpose**: Tracks transient context while an active operational workflow is executing.
- **Storage Mechanism**: Redis / SQLite `workflow_states` table with JSON payload.
- **Lifetime**: Duration of the workflow lifecycle (cleared/archived upon reaching terminal state: `PUBLISHED`, `COMPLETED`, `REJECTED`).
- **Schema Example**:
  ```json
  {
    "workflow_id": "WF-CAT-20260820-0012",
    "workflow_type": "CATALOGUE_INGESTION",
    "current_step": "CLASSIFYING",
    "retry_count": 1,
    "payload": {
      "file_name": "Autumn_Collection_2026.pdf",
      "processed_pages": [1, 2, 3, 4],
      "pending_pages": [5, 6],
      "extracted_products": ["TEMP-01", "TEMP-02"]
    },
    "created_at": "2026-08-20T04:40:00Z"
  }
  ```

---

## 3. Structured Business Memory (Long-Term Memory)

- **Purpose**: Stores historical business records, customer behavior metrics, and operational performance to inform future AI recommendations.
- **Storage Mechanism**: Relational SQLite / PostgreSQL database.
- **Key Business Memory Modules**:

### A. Customer Intelligence Memory (`customer_metrics`)
- Tracks purchase count, lifetime spending, preferred garment categories, return rates, and calculated average purchase interval (days).
- Used by Follow-up Worker to generate personalized re-engagement suggestions.

### B. Product Knowledge Memory (`products` & `product_attributes`)
- Vector embeddings and attribute index of all active and soft-deleted sarees/suits.
- Used by Duplicate Detector and Billing Photo Matcher.

### C. Approval & Rejection Memory (`approval_history`)
- Tracks all decisions made by the owner (`APPROVED`, `EDITED`, `REJECTED`).
- Allows the AI Worker to learn owner preferences over time (e.g. preferred fallback pricing rules or phrasing tone).

---

## 4. Privacy & Data Minimization Rule for LLM Memory Context

When injecting business memory into the LLM prompt context:
- **Minimize PII**: Replace explicit customer names and phone numbers with anonymous tokens (`Customer C-1049`).
- **Summary Over Raw Dump**: Inject aggregated metrics (`Purchases: 4, Preferred: Sarees`) rather than dumping 50 raw order JSON objects into prompt context.
