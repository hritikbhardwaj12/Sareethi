# Sareethi — AI-Operated Digital Operating System for Local Women's Fashion Retailers

[![Repository](https://img.shields.io/badge/GitHub-Sareethi-blue.svg)](https://github.com/hritikbhardwaj12/Sareethi.git)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"The shop owner should not have to manually maintain a complicated digital store. She provides the catalogue, pricing information, stock information, customer/order information when required, and approvals for sensitive actions. Sareethi handles the repetitive operational work through an AI Worker."**

---

## 📌 Executive Summary

**Sareethi** is a mobile-first, AI Worker-driven digital operating platform tailored specifically for local women's fashion retailers selling sarees, suits, and ladies' clothing. 

Unlike traditional static e-commerce platforms (Shopify, WooCommerce) or basic conversational chatbots, Sareethi is an **autonomous workflow system** that connects raw physical/digital catalogues directly to an active customer storefront, billing desk, inventory engine, and customer intelligence system.

---

## 🎯 Main Users & Personas

### 1. The Customer (Mobile-First Experience)
- Accesses the store predominantly via smartphone.
- Browses sarees, suits, and collections using visual cards and rich attributes (fabric, color, pattern, occasion).
- Easily filters, searches, views image galleries, and places orders.
- Experiences a polished fashion storefront where AI operations remain invisible.

### 2. The Shop Owner / Admin (Control Center)
- Operates the business through a unified 3-section Admin Panel: **Dashboard**, **Store**, and **Billing**.
- Acts as the ultimate authority for high-impact decisions (refunds, pricing overrides, deletion).
- Reviews AI recommendations via a structured **Human Approval Queue**.

---

## 🏛 Architecture Overview

```text
                    ┌──────────────────────┐
                    │     CUSTOMER UI      │
                    │  Mobile-first Store  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      BACKEND API     │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        PRODUCT SYSTEM     ORDER SYSTEM    CUSTOMER SYSTEM
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    SAREETHI WORKER   │
                    │                      │
                    │ Reasoning + Tools    │
                    │ State + Memory       │
                    │ Approval + Escalation│
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
      AI/LLM               Tool Layer           Audit Layer
          │                    │                     │
          └────────────────────┼─────────────────────┘
                               ▼
                         DATABASE / STATE
```

---

## 🤖 AI Worker Capabilities & Autonomy Tiers

Sareethi operates under a **Strict 3-Tier Autonomy Model**:

| Autonomy Tier | Capabilities & Scope | Control Policy |
| :--- | :--- | :--- |
| **Level 1 — Autonomous** | Catalogue ingestion, product detection, photo grouping, duplicate filtering, attribute extraction, price extraction, backend ID generation, description drafting, inventory alerts, metric aggregation, audit logging. | Executes automatically without manual intervention. |
| **Level 2 — Recommendation + Approval** | Customer follow-up messaging, discount recommendations, delayed-order communication, uncertain product classification, catalogue adjustments. | Requires Owner explicit approval (`APPROVE` / `EDIT` / `REJECT`). |
| **Level 3 — Human Only** | Refunds, financial adjustments, permanent deletion, price overrides, sensitive customer updates. | AI cannot execute under any circumstance. |

---

## 📂 Documentation Sitemap

| Document | Description |
| :--- | :--- |
| [**AGENTS.md**](./AGENTS.md) | Agent role definitions, tool access policies, and state machine integration. |
| [**SOUL.md**](./SOUL.md) | Operating philosophy, core mantras, communication style, and ethical boundaries. |
| [**TOOLS.md**](./TOOLS.md) | Complete catalog of 25+ controlled tools with input/output schemas and permission gates. |
| [**MEMORY.md**](./MEMORY.md) | Operational state vs business memory retention architecture. |
| [**docs/product-spec.md**](./docs/product-spec.md) | In-depth module specifications (Storefront, Billing, Returns, Analytics, Inventory). |
| [**docs/architecture.md**](./docs/architecture.md) | Database entities, system boundaries, and LLM vs Backend responsibility separation. |
| [**docs/workflows.md**](./docs/workflows.md) | Explicit state machine transitions for Catalogue, Billing, Orders, Returns, Exceptions. |
| [**docs/privacy.md**](./docs/privacy.md) | DPDP compliance, PII minimization, prompt sanitization guidelines. |
| [**docs/security.md**](./docs/security.md) | Security boundaries, credential handling, action authorization. |
| [**docs/definition-of-done.md**](./docs/definition-of-done.md) | Formal completion checklist and demo verification criteria. |

---

## ⚡ Key Workflows at a Glance

1. **Catalogue Ingestion**: PDF / Image / Video $\rightarrow$ Content Extraction $\rightarrow$ Image Grouping $\rightarrow$ Classification $\rightarrow$ Fallback Pricing $\rightarrow$ ID Assignment $\rightarrow$ Publishing / Approval.
2. **Quick Billing**: Customer Details $\rightarrow$ Capture Photos $\rightarrow$ AI Product Match / Price Lookup $\rightarrow$ PDF Generation $\rightarrow$ Simulated WhatsApp Send $\rightarrow$ Inventory & Metric Updates.
3. **Delayed Order Handling**: Order Delay Detected $\rightarrow$ Risk Severity Calculated $\rightarrow$ Exception Logged $\rightarrow$ Recommends Communication $\rightarrow$ Owner Approval (No Auto-Refunds).
4. **Returns Management**: Lookup Bill $\rightarrow$ Select Returned Items $\rightarrow$ Re-calculate Financials $\rightarrow$ Restock Inventory $\rightarrow$ Customer History Update $\rightarrow$ Audit Logged.

---

## 📜 Core Operating Philosophy

> **"AI automates work, deterministic systems protect business data, and humans retain control over consequential decisions."**
