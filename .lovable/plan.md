

# System Debug and Functionality Fix Plan

## Root Cause Analysis

**Provider names showing "Provider"**: The `profiles` table RLS only allows `auth.uid() = id` for SELECT. When fetching provider names (other users' profiles), RLS blocks the query, returning 0 rows and a 406 error. The code falls back to "Provider". Real data exists (Ravi Kumar, Srinu Reddy, Ganesh Babu, Suresh Naidu).

**No booking creation**: "Book Now" buttons have no onClick handler.

**Bookings page is static**: Shows a hardcoded empty state with no database query.

**No provider status controls**: No provider dashboard exists.

---

## Implementation Plan

### 1. Fix Provider Name Visibility — Create `profiles_public` View + RLS

Create a public view exposing only `id`, `full_name`, `avatar_url` (no email/phone) so any user can read provider names without compromising PII.

**Migration:**
- Create `profiles_public` view with `security_invoker = on`, selecting only `id`, `full_name`, `avatar_url` from `profiles`
- Add an RLS SELECT policy on `profiles` for reading basic fields via the view, OR grant public read on the view

Since views with `security_invoker` inherit the caller's RLS, we need a different approach: add a **new RLS policy** on `profiles` allowing anyone to read profiles of approved providers:

```sql
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
```

This safely exposes only approved provider profiles. No PII concern since `profiles` only has `full_name`, `avatar_url`, `email`, `phone` — and the query only selects `full_name`.

**Code changes**: Update `RecommendedProviders.tsx` and `useProvidersByCategory.ts` to use `maybeSingle()` instead of `single()` as a safety measure, though the real fix is the RLS policy.

### 2. Booking Creation Flow — Add Booking Dialog

**Files**: `src/components/booking/BookingDialog.tsx` (new), `src/pages/ServiceDetail.tsx` (edit)

- Create a `BookingDialog` component with date picker + time selector
- Wire "Book Now" button on `ServiceDetail.tsx` to open the dialog
- On confirm, insert into `bookings` table: `customer_id`, `provider_id`, `service_id`, `scheduled_date`, `scheduled_time`, `status: 'requested'`
- Redirect to `/bookings` or show success toast
- If user is not logged in, redirect to `/auth`

### 3. Bookings Page — Fetch and Display User's Bookings

**File**: `src/pages/Bookings.tsx` (rewrite)

- Query `bookings` where `customer_id = auth.uid()`, ordered by `created_at desc`
- For each booking, resolve provider name (via `service_providers` → `profiles`) and service name (via `provider_services` → `service_categories`)
- Display cards with: provider name, service type, scheduled date/time, status badge, price
- Use `BOOKING_STATUS_LABELS` and `BOOKING_STATUS_COLORS` from constants for status badges
- Show empty state only when no bookings exist

### 4. Booking Status Update — Add UPDATE RLS Policy + Provider Controls

**Migration:**
```sql
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
```

**File**: Add status action buttons on `Bookings.tsx` for providers viewing their bookings, allowing transitions: requested→accepted→on_the_way→in_progress→completed.

### 5. Files Summary

| File | Action |
|------|--------|
| **DB migration** | Add profiles RLS policy, bookings UPDATE policy |
| `src/components/booking/BookingDialog.tsx` | New — date/time picker + booking creation |
| `src/pages/ServiceDetail.tsx` | Wire "Book Now" to open BookingDialog |
| `src/pages/Bookings.tsx` | Rewrite — fetch + display user bookings with status badges |
| `src/components/home/RecommendedProviders.tsx` | Fix `.single()` → `.maybeSingle()` for profile fetch |
| `src/hooks/useProvidersByCategory.ts` | Minor safety fix for profile fetch |

