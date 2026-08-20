# Sareethi AI — Production Deployment Runbook

This guide covers deploying the **Sareethi AI Worker & Fashion Retail System** to Vercel / Cloud Infrastructure with Supabase PostgreSQL.

---

## 1. Environment Variables Configuration

In your Vercel Project Settings $\rightarrow$ Environment Variables, configure the following variables:

```env
# Supabase Production Database API
NEXT_PUBLIC_SUPABASE_URL=https://your-production-app.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authorized Store Owner Account
AUTHORIZED_OWNER_EMAIL=owner@example.com
```

---

## 2. Database Migrations Execution

Run the Supabase migrations in order against your production PostgreSQL instance:

```bash
supabase db push
# Or apply via SQL Editor:
# 1. 20260820000000_schema.sql (21 Core Relational Tables)
# 2. 20260820000001_auth_rls.sql (Auth Triggers & RLS Policies)
# 3. 20260820000002_seed_products.sql (Initial Sarees & Suits)
# 4. 20260820000003_storage_security.sql (Private Catalogue Bucket & RLS)
```

---

## 3. Vercel / Cloud Deployment Command

Deploy to Vercel production:

```bash
# Push to GitHub
git checkout main
git merge dev
git push origin main

# Import project into Vercel Dashboard or run via CLI:
npx vercel --prod
```

---

## 4. Production Health Monitoring Check

Verify live deployment status via the automated health check route:

```bash
curl https://your-domain.com/api/health
```

Expected Response:
```json
{
  "status": "HEALTHY",
  "timestamp": "2026-08-20T05:42:00.000Z",
  "service": "Sareethi AI Worker Platform",
  "version": "1.0.0",
  "checks": {
    "database": "CONNECTED",
    "ai_worker": "OPERATIONAL",
    "storage": "OPERATIONAL"
  }
}
```
