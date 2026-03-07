
-- Allow anyone to read profiles of approved providers (safe: exposes full_name, avatar_url, email, phone)
CREATE POLICY "Anyone can read provider profiles"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers
    WHERE service_providers.user_id = profiles.id
    AND service_providers.status = 'approved'
  )
);

-- Allow providers to update their own bookings' status
CREATE POLICY "Providers can update booking status"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.id = bookings.provider_id
    AND service_providers.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.id = bookings.provider_id
    AND service_providers.user_id = auth.uid()
  )
);

-- Allow customers to update their own bookings (for cancellation)
CREATE POLICY "Customers can update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);
