

# Phase 2: Supabase Backend & Auth — Implementation Plan

## Overview
Set up the complete database schema, authentication, RLS policies, storage buckets, and auth UI for the FixNow platform.

---

## Step 1: Database Schema Migration

Create all core tables in a single migration:

**Enums:**
- `app_role` — admin, moderator, user (for role system)
- `booking_status` — requested, accepted, on_the_way, in_progress, completed, cancelled
- `provider_status` — pending, approved, rejected

**Tables:**
1. `profiles` — id (FK auth.users), full_name, email, phone, avatar_url, created_at
2. `user_roles` — id, user_id (FK auth.users), role (app_role)
3. `addresses` — id, user_id, label, street, city, state, pincode, lat, lng
4. `service_categories` — id, name, icon_name, color, description, is_active
5. `service_providers` — id, user_id (FK profiles), experience_years, bio, verified, is_online, coverage_area_km, commission_rate, status (provider_status)
6. `provider_services` — id, provider_id (FK service_providers), category_id (FK service_categories), base_price
7. `bookings` — id, customer_id, provider_id, service_id (FK provider_services), status (booking_status), scheduled_date, scheduled_time, address_id, notes, created_at, updated_at
8. `reviews` — id, booking_id (FK bookings), customer_id, provider_id, quality, punctuality, professionalism, cleanliness, comment, created_at
9. `system_logs` — id, event_type, user_id, details (jsonb), created_at

**Functions & Triggers:**
- `has_role(uuid, app_role)` — security definer function for RLS
- `handle_new_user()` trigger — auto-create profile on signup

## Step 2: RLS Policies

- **profiles**: Users read/update own; admins read all
- **user_roles**: Only admins manage; users read own
- **addresses**: Users CRUD own addresses
- **service_categories**: Public read; admin write
- **service_providers**: Public read (approved only); owner update own; admin manage all
- **provider_services**: Public read; provider manage own
- **bookings**: Customer/provider read own; admin read all; customer create
- **reviews**: Public read; customer create (own bookings only)
- **system_logs**: Admin read only

## Step 3: Seed Data

Insert 14 service categories (Electrician, Plumber, AC Repair, etc.) matching the existing `constants.ts` definitions.

## Step 4: Storage Buckets

Create 3 buckets: `profile-photos`, `portfolio-images`, `verification-documents` with appropriate RLS.

## Step 5: Authentication UI

- Create `AuthPage` with email/password sign-up and sign-in (tabbed interface)
- Create `AuthProvider` context for session management using `onAuthStateChange`
- Create `ProtectedRoute` wrapper
- Add `/auth` route
- Profile page: show logged-in user info, working sign-out

## Step 6: Update Frontend

- Wire up the Supabase types (auto-generated after migration)
- Update profile page to show real user data
- Prepare hooks for data fetching (categories, providers, bookings)

---

## Technical Notes
- All user_id columns are non-nullable where RLS depends on them
- Phone field included on profiles for future OTP support
- The `has_role()` security definer function prevents recursive RLS issues
- Provider status enum allows admin verification workflow

