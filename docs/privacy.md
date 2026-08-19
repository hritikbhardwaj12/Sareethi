# Privacy & DPDP Compliance Specification — Sareethi

This document outlines how **Sareethi** adheres to privacy-by-design principles and data protection standards (aligned with India's DPDP Act).

---

## 1. Core Privacy Architecture

```text
       SENSITIVE CUSTOMER DATA                       ANONYMIZED AI CONTEXT
  (Phone, Address, Billing Records)             (Metrics, Category Counts, Order ID)
                 │                                                │
                 ▼                                                ▼
     ┌───────────────────────┐                        ┌───────────────────────┐
     │  Isolating Backend DB │                        │  Sareethi AI Worker   │
     │  Strict Access Control│                        │  Prompt Sanitizer     │
     └───────────────────────┘                        └───────────────────────┘
```

---

## 2. PII Minimization Rules

1. **Prompt Sanitization**: When customer behavior data is provided to the AI Worker for follow-up message generation or analytics, PII (Full Name, Phone Number, Full Address) is stripped or tokenized into pseudonyms (`Customer C-1024`).
2. **Minimum Exposure**: The AI Worker receives only metrics necessary for its immediate task (`Total Orders: 7`, `Avg Order: ₹2,850`, `Days Since Last Purchase: 42`).
3. **No Direct External Storage**: Customer personal data is never transmitted to unvetted 3rd-party services.

---

## 3. Data Classification Matrix

| Data Category | Examples | Storage Location | AI Context Visibility |
| :--- | :--- | :--- | :--- |
| **Public Product Data** | Saree photos, Title, Fabric, Color, Selling Price | Public DB / Storefront | Full Access |
| **Private Admin Data** | Cost Price, Supplier Notes, Profit Margins | Admin DB | Restricted to Internal Tools |
| **Customer PII** | Phone Number, Customer Name, Delivery Address | Secure Backend DB | Tokenized / Anonymized |
| **Customer Metrics** | Order Count, Return Rate, Buying Interval | Analytics Aggregates | Full Access (For Reasoning) |

---

## 4. Audit & Transparency

- Every AI operation involving customer re-engagement drafts records the exact prompt context used.
- The owner can view what customer evidence informed an AI follow-up recommendation.
