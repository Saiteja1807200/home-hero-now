
-- 1. Restrict messages UPDATE to only read_at column
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (read_at) ON public.messages TO authenticated;

-- 2. Revoke has_role() from anon and authenticated to prevent role enumeration
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

-- 3. Drop overly broad provider SELECT policy that leaks commission_rate
DROP POLICY IF EXISTS "Anyone can read approved providers" ON public.service_providers;

-- Ensure public_providers view remains accessible
GRANT SELECT ON public.public_providers TO anon, authenticated;
