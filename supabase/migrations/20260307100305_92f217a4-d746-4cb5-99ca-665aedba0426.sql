
-- Replace the overly permissive customer update policy with a cancellation-only policy
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;

CREATE POLICY "Customers can cancel own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id AND status = 'requested')
WITH CHECK (auth.uid() = customer_id AND status = 'cancelled');
