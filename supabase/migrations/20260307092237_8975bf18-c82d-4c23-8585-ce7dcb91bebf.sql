-- Fix: make the view security invoker instead of security definer
DROP VIEW IF EXISTS public.public_provider_profiles;
CREATE VIEW public.public_provider_profiles
WITH (security_invoker = on) AS
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  JOIN public.service_providers sp ON sp.user_id = p.id
  WHERE sp.status = 'approved';

GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- Since the view uses security_invoker, we need an RLS policy on profiles
-- that allows reading ONLY full_name and avatar_url for approved providers.
-- But RLS is row-level not column-level, so we need the row-level policy back.
-- Instead, let's use a SECURITY DEFINER function to safely fetch provider profiles.
-- Actually, the simplest safe approach: use a security_barrier view without security_invoker.
-- Let me use a different approach - a security definer function.

-- Drop the view approach
DROP VIEW IF EXISTS public.public_provider_profiles;

-- Create a safe function to get provider profile info
CREATE OR REPLACE FUNCTION public.get_provider_profile(provider_user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  JOIN public.service_providers sp ON sp.user_id = p.id
  WHERE sp.status = 'approved' AND p.id = provider_user_id
  LIMIT 1;
$$;

-- Also create a bulk version for efficiency
CREATE OR REPLACE FUNCTION public.get_provider_profiles(provider_user_ids uuid[])
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  JOIN public.service_providers sp ON sp.user_id = p.id
  WHERE sp.status = 'approved' AND p.id = ANY(provider_user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_provider_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_provider_profiles(uuid[]) TO anon, authenticated;