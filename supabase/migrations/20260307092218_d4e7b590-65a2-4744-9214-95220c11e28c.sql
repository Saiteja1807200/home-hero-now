-- 1. Create a safe public view for provider profiles (no email/phone)
CREATE OR REPLACE VIEW public.public_provider_profiles AS
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  JOIN public.service_providers sp ON sp.user_id = p.id
  WHERE sp.status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- Drop the broad RLS policy that exposes email/phone
DROP POLICY IF EXISTS "Anyone can read provider profiles" ON public.profiles;

-- 2. Tighten service_providers INSERT policy to enforce safe defaults
DROP POLICY IF EXISTS "Users can create own provider" ON public.service_providers;
CREATE POLICY "Users can create own provider"
ON public.service_providers FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND verified = false
  AND commission_rate = 15.00
);