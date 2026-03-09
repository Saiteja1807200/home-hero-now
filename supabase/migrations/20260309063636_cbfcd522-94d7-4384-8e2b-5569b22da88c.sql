-- 1. Security definer function to let providers read customer profiles
CREATE OR REPLACE FUNCTION public.get_customer_profile(customer_user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = customer_user_id
  LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_customer_profile(uuid) TO authenticated;

-- 2. Allow providers to create conversations for their bookings
CREATE POLICY "Providers can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.id = conversations.provider_id
      AND sp.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = conversations.booking_id
      AND b.provider_id = conversations.provider_id
  )
);