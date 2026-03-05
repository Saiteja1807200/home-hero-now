

# Replace Hardcoded Home Page Data with Real Supabase Queries

## Changes

### 1. Active Booking Card — query-driven, conditional render
- In `Index.tsx`, use the `AuthContext` to get the current user
- Query `bookings` table for the logged-in user where `status IN ('accepted', 'on_the_way', 'in_progress')`, limit 1
- Join with `service_categories` (via `provider_services.category_id`) for the service name, and `profiles` (via `service_providers.user_id`) for the provider name
- Only render `ActiveBookingCard` if a booking exists; hide entirely otherwise
- If user is not logged in, skip the query and hide the card

### 2. Recommended Providers — fetch from Supabase
- Replace `MOCK_PROVIDERS` array with a query to `public_providers` (approved, online providers)
- Join with `profiles` for name/avatar and `provider_services` + `service_categories` for service name
- Compute review stats from `reviews` table (average rating, count as "jobs")
- Distance/ETA will remain placeholder strings since there's no geolocation yet
- Show skeleton loading state while fetching
- Show nothing or empty state if no providers exist

### Files to edit
- **`src/pages/Index.tsx`** — add auth check + booking query, conditionally render `ActiveBookingCard`
- **`src/components/home/RecommendedProviders.tsx`** — replace mock data with Supabase query using `useQuery`

