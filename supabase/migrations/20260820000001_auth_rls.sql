-- Sareethi Auth & Row-Level Security Migration Script
-- Version: 20260820000001

-- 1. Business Settings Table (Stores Authorized Owner Email Configuration)
CREATE TABLE IF NOT EXISTS business_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO business_settings (key, value) VALUES
('authorized_owner_email', 'owner@example.com'),
('store_name', 'Sareethi Fashion Retail'),
('owner_fallback_price', '1499')
ON CONFLICT (key) DO NOTHING;

-- 2. Function to Check if Current User is Store Owner / Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_email TEXT;
    owner_email TEXT;
    user_role TEXT;
BEGIN
    SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
    SELECT value INTO owner_email FROM business_settings WHERE key = 'authorized_owner_email';
    SELECT role_id INTO user_role FROM public.profiles WHERE id = auth.uid();

    IF current_user_email = owner_email OR user_role = 'OWNER' THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Function: Auto-create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    configured_owner_email TEXT;
    assigned_role TEXT := 'CUSTOMER';
BEGIN
    SELECT value INTO configured_owner_email FROM public.business_settings WHERE key = 'authorized_owner_email';
    
    IF NEW.email = configured_owner_email THEN
        assigned_role := 'OWNER';
    END IF;

    INSERT INTO public.profiles (id, role_id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Customer'),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        email = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS) on Critical Tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Product Policies: Everyone can read active products; Only Owner can insert/update/delete
CREATE POLICY "Public products viewable" ON public.products
    FOR SELECT USING (status != 'DELETED' OR is_admin());

CREATE POLICY "Owner product modifications" ON public.products
    FOR ALL USING (is_admin());

-- Bills Policies: Only Owner can read and create bills
CREATE POLICY "Owner bills access" ON public.bills
    FOR ALL USING (is_admin());

-- Approvals Policies: Only Owner can view and update approval queue
CREATE POLICY "Owner approvals access" ON public.approvals
    FOR ALL USING (is_admin());

-- Audit Logs Policies: Only Owner can read audit records
CREATE POLICY "Owner audit access" ON public.audit_logs
    FOR SELECT USING (is_admin());
