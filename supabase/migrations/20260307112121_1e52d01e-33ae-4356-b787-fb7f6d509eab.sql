
-- Add columns to service_providers
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS coverage_area text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'Mancherial';

-- Recreate view to include new columns
DROP VIEW IF EXISTS public.public_providers;
CREATE VIEW public.public_providers WITH (security_invoker = on) AS
  SELECT id, user_id, experience_years, bio, verified, is_online,
         coverage_area_km, coverage_area, city, status, created_at
  FROM public.service_providers
  WHERE status = 'approved';
