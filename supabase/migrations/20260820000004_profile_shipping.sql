-- Add shipping_address to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shipping_address TEXT;
