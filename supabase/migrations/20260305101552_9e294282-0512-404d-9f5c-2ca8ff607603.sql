
-- Fix 1: Revoke public EXECUTE on has_role to prevent role enumeration via RPC
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

-- Fix 2: Create a public view for service_providers that excludes commission_rate
CREATE VIEW public.public_providers WITH (security_invoker = on) AS
  SELECT id, user_id, experience_years, bio, verified, is_online,
         coverage_area_km, status, created_at
  FROM public.service_providers
  WHERE status = 'approved';
