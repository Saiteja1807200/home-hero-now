

# Plan: Make the App Production-Ready

Here's what needs to happen to turn the current UI shells into a working application, organized by priority.

## Phase 1: Wire Up Live Data (Categories & Providers)

**1a. Fetch service categories from Supabase instead of hardcoded constants**
- Create a custom hook `useServiceCategories` that queries the `service_categories` table
- Map the `icon_name` field from the DB to actual Lucide icon components (keep a lookup map in constants)
- Update `CategoryGrid`, `Services`, and `ServiceDetail` to use the hook instead of `SERVICE_CATEGORIES`

**1b. Show real providers on ServiceDetail page**
- Query `public_providers` view joined with `provider_services` and `profiles` (via `profiles_public` or own profile) filtered by `category_id`
- Display provider cards with name, bio, experience, verified badge
- Keep the empty state when no providers match

## Phase 2: Booking Flow

**2a. Provider detail page** (`/providers/:providerId`)
- Show provider info, services offered with prices, reviews
- "Book Now" button opens a booking sheet/dialog

**2b. Booking creation**
- Date/time picker, address selection (from user's saved addresses or add new)
- Insert into `bookings` table
- Toast confirmation

**2c. Live Bookings page**
- Query `bookings` table for logged-in user, join with provider/service info
- Show status badges, scheduled date/time
- Replace the hardcoded `ActiveBookingCard` on Index with real active booking query

## Phase 3: Profile & Addresses

- **Editable profile**: Update `full_name`, `phone`, upload avatar to `profile-photos` bucket
- **Saved addresses**: CRUD addresses from the Profile page, use them during booking

## Phase 4: Publish Readiness

- **Remove mock data**: Delete hardcoded `MOCK_PROVIDERS` in `RecommendedProviders` and the static `ActiveBookingCard` props on Index
- **Password reset flow**: Add forgot password link on Auth page + `/reset-password` route
- **Error boundaries**: Add a top-level error boundary for graceful error handling
- **PWA metadata**: Verify `manifest.json` has correct app name, icons, theme color
- **Publish**: Click the Publish button in the top-right corner of the Lovable editor

## Recommended Build Order

1. Wire categories from Supabase (Phase 1a) — makes the app feel "real" immediately
2. Build the booking flow (Phase 2) — core functionality
3. Profile editing (Phase 3) — user engagement
4. Cleanup & publish (Phase 4)

Each phase is a separate set of prompts you can ask me to build. I'd recommend starting with **Phase 1a: "Wire up the CategoryGrid and Services pages to fetch categories from the Supabase service_categories table instead of hardcoded constants."**

