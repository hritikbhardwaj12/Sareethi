-- Migration 20260820000003_storage_security.sql
-- Private Storage Bucket & RLS Access Policies for Catalogues and Customer Documents

-- 1. Create Private Storage Bucket 'catalogues'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalogues',
  'catalogues',
  false, -- Private bucket
  104857600, -- 100MB max limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Storage RLS Policies: Store Owner Only Access

-- Policy: Store Owner Read Access
CREATE POLICY "Store Owner Private Catalogue Read Access"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'catalogues' AND is_admin()
);

-- Policy: Store Owner Insert Access
CREATE POLICY "Store Owner Private Catalogue Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catalogues' AND is_admin()
);

-- Policy: Store Owner Delete Access
CREATE POLICY "Store Owner Private Catalogue Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'catalogues' AND is_admin()
);
