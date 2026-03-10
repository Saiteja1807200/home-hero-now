-- 1. Revoke has_role from anon and authenticated to prevent role enumeration
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

-- 2. Create a safe is_admin() function that only checks the calling user's own role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Grant to authenticated only (not anon - no anonymous admin checks needed)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Drop the overly broad SELECT policy that leaks commission_rate
DROP POLICY "Anyone can read approved providers" ON public.service_providers;

-- 4. Ensure the public_providers view remains accessible
GRANT SELECT ON public.public_providers TO anon, authenticated;