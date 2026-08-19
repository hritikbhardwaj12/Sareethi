# Security & Governance Architecture — Sareethi

This document specifies security boundaries, authorization gates, credential handling, and protection against unauthorized or hallucinated AI operations.

---

## 1. Security Principles

1. **Defense in Depth**: The LLM prompt instructions (`AGENTS.md`, `SOUL.md`) serve as behavioral guidelines, while backend API middleware enforces strict authorization rules.
2. **Tool Authorization Wrapper**: Every tool invocation from the AI Worker passes through an internal security wrapper that validates permissions against the 3-Tier Autonomy Model.
3. **Immutability of Audit Records**: Audit logs are append-only and protected against deletion.

---

## 2. Authorization Matrix

| Action | Requested By AI | Requested By Owner | Backend Authorization Gate |
| :--- | :--- | :--- | :--- |
| Read Product Catalogue | Allowed | Allowed | `PERM_READ_CATALOGUE` |
| Create Draft Product | Allowed | Allowed | `PERM_WRITE_PRODUCT` |
| Publish Product | Allowed (High Confidence) | Allowed | `PERM_PUBLISH_PRODUCT` |
| Approve Follow-up Message | Blocked | Allowed | `PERM_APPROVE_ACTION` |
| Soft Delete Product | Blocked | Allowed (With Confirm Modal) | `PERM_SOFT_DELETE` |
| Process Customer Refund | **BLOCKED STRICTLY** | Allowed | `PERM_MANUAL_REFUND_ONLY` |

---

## 3. Defense Against LLM Hallucinated Actions

- **Input Schema Validation**: Tool arguments are validated against strict Pydantic schemas. Unexpected fields trigger tool rejection.
- **State Verification**: Before executing state changes, backend verifies workflow state (e.g. cannot issue bill for `DELETED` product).
- **Financial Bounds**: Disallows applying discounts exceeding owner-configured maximum thresholds ($>25\%$).
