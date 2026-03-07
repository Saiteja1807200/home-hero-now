
-- Fix: Restrict service_providers UPDATE policy to prevent self-approval/self-verify
DROP POLICY IF EXISTS "Owners can update own provider" ON public.service_providers;

CREATE POLICY "Owners can update own provider"
ON public.service_providers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = (SELECT sp.status FROM public.service_providers sp WHERE sp.user_id = auth.uid())
  AND verified = (SELECT sp.verified FROM public.service_providers sp WHERE sp.user_id = auth.uid())
  AND commission_rate = (SELECT sp.commission_rate FROM public.service_providers sp WHERE sp.user_id = auth.uid())
);
