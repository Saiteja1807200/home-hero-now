-- Recreate public_providers view WITHOUT security_invoker so it bypasses base table RLS
DROP VIEW IF EXISTS public.public_providers;
CREATE VIEW public.public_providers AS
  SELECT id, user_id, experience_years, bio, verified, is_online,
         coverage_area_km, coverage_area, city, status, created_at
  FROM public.service_providers
  WHERE status = 'approved';

-- Recreate public_reviews view WITHOUT security_invoker (excludes customer_id for privacy)
DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews AS
  SELECT id, provider_id, booking_id, quality, punctuality,
         cleanliness, professionalism, comment, created_at
  FROM public.reviews;