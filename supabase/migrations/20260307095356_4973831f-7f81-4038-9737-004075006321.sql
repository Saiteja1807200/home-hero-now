
-- 1. Create a public_reviews view that excludes customer_id
CREATE VIEW public.public_reviews
WITH (security_invoker = on) AS
  SELECT id, provider_id, booking_id, quality, punctuality, cleanliness, professionalism, comment, created_at
  FROM public.reviews;

-- 2. Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;

-- 3. Add restrictive SELECT policies on the base table
-- Customers can read their own reviews
CREATE POLICY "Customers can read own reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Providers can read reviews about them
CREATE POLICY "Providers can read their reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_providers
      WHERE service_providers.id = reviews.provider_id
        AND service_providers.user_id = auth.uid()
    )
  );

-- Admins can read all reviews
CREATE POLICY "Admins can read all reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
