

## Problem: Data Exists but Views Return Empty

### Root Cause

Both `public_providers` and `public_reviews` views were created with `security_invoker=on`. This means they inherit the **caller's** RLS permissions on the base tables (`service_providers` and `reviews`).

The `service_providers` RLS only allows:
- **Owners** to SELECT their own row
- **Admins** to SELECT all

There is **no public/anon SELECT policy** on `service_providers`. So when an unauthenticated user (or even a logged-in non-provider) queries `public_providers`, the view returns **empty results** because RLS blocks access to the underlying `service_providers` table.

Same issue affects `public_reviews` -- the `reviews` table only allows customers, providers, and admins to read reviews. No public read policy exists.

### Your Provider Account

You have two provider registrations:
- One with status `pending` (empty coverage_area)
- One with status `rejected` and `is_online=false`

Neither would show up even if the view worked, since the view filters `status = 'approved'`.

### Fix (single migration)

1. **Add a public SELECT policy on `service_providers`** that allows anon and authenticated users to read approved providers (excluding sensitive fields like `commission_rate` -- but since the view already excludes it, we just need a policy that allows reading approved rows):

```sql
CREATE POLICY "Anyone can read approved providers"
ON public.service_providers
FOR SELECT TO anon, authenticated
USING (status = 'approved');
```

2. **Add a public SELECT policy on `reviews`** so `public_reviews` view works:

```sql
CREATE POLICY "Anyone can read reviews via view"
ON public.reviews
FOR SELECT TO anon, authenticated
USING (true);
```

Wait -- this would expose `customer_id` in the base `reviews` table. But `public_reviews` view already excludes `customer_id`. Since `security_invoker=on` checks RLS on the base table but only returns view columns, this is acceptable. However, a direct query to `reviews` table would also work. A safer approach: scope the public SELECT to only what the view needs, or accept that review data (without customer identity in the view) is public.

Actually, looking more carefully: the `public_reviews` view excludes `customer_id` but a user could query the `reviews` table directly with this policy. To prevent that, we should **not** add a blanket policy on `reviews`. Instead, we should **recreate the views without `security_invoker`** so they use the view owner's permissions (which bypasses RLS).

**Better approach: Recreate both views without `security_invoker=on`**

This is the standard pattern for public-facing views that intentionally expose a filtered subset of data. The view owner (postgres) has full access, and the view itself controls what columns/rows are exposed.

```sql
DROP VIEW IF EXISTS public.public_providers;
CREATE VIEW public.public_providers AS
  SELECT id, user_id, experience_years, bio, verified, is_online,
         coverage_area_km, coverage_area, city, status, created_at
  FROM service_providers
  WHERE status = 'approved';

DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews AS
  SELECT id, provider_id, booking_id, quality, punctuality,
         cleanliness, professionalism, comment, created_at
  FROM reviews;
```

By removing `security_invoker=on`, these views will use the **definer's** (owner's) permissions, bypassing RLS on the base tables. The views themselves act as the security boundary by only exposing safe columns (no `commission_rate`, no `customer_id`).

### Files Changed

| File | Change |
|------|--------|
| New migration | Recreate `public_providers` and `public_reviews` views without `security_invoker=on` |

No frontend code changes needed. Data already exists and will immediately appear once the views work.

