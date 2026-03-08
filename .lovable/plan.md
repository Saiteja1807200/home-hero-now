

# Fix: Delete Account Edge Function Error

## Problem

The edge function fails with `"supabaseKey is required."` because it reads `SUPABASE_PUBLISHABLE_KEY` (line 19), which is not a standard Supabase Edge Function environment variable. The correct variable name is `SUPABASE_ANON_KEY`.

Additionally, the function only deletes `addresses` and `profiles`, but there are other tables with `user_id` references (`user_roles`, `service_providers`, `public_providers`, `system_logs`) and potentially `bookings` (via `customer_id`/`provider_id`) that could block deletion due to foreign key constraints.

## Changes

### File: `supabase/functions/delete-account/index.ts`

1. **Line 19**: Change `SUPABASE_PUBLISHABLE_KEY` to `SUPABASE_ANON_KEY`
2. **Before deleting profile**, add deletion of related rows from:
   - `user_roles` (where `user_id`)
   - `service_providers` (where `user_id`)
   - `public_providers` (where `user_id`)
   - `system_logs` (where `user_id`)
   - `provider_services` (where `provider_id` matches user)
   - `reviews` / `public_reviews` (where `customer_id` or `provider_id`)
   - `bookings`: set `customer_id`/`provider_id` to null (preserve records for archival)

Order: delete child references first, then `profiles`, then auth user.

