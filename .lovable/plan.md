

# Profile Tab Functionality Fix + Settings Improvement

## Overview

This is a large feature set. I will create 4 new pages (EditProfile, SavedAddresses, Settings) and update the Profile page to wire navigation and show dynamic stats. No DB schema changes needed -- existing `profiles` and `addresses` tables cover the requirements. For notification preferences, I'll use localStorage since adding columns would require a migration for non-critical UI preferences. Theme preference will also use localStorage + next-themes (already installed).

## Database Considerations

- **No schema changes needed.** The `profiles` table already has `full_name`, `avatar_url`, `phone`, `email`. The `addresses` table has `street`, `city`, `state`, `pincode`, `lat`, `lng`, `label`. These cover the requirements.
- Notification preferences and theme preference will be stored in localStorage (lightweight, no migration needed).
- "Delete from history" / "archive" bookings: We won't add a `hidden_by_customer` column -- instead we'll use localStorage to track hidden booking IDs, keeping it simple without a migration.
- Account deletion requires a Supabase edge function (can't delete auth users from client). Will implement as a confirmation dialog that calls an edge function.

## New Files

### 1. `src/pages/EditProfile.tsx`
- Fetch current profile from `profiles` table
- Form fields: Full Name (text), Phone (text), Email (read-only, from auth)
- Avatar: upload to `profile-photos` storage bucket, update `avatar_url`
- Save updates to `profiles` table via `.update()`
- On save: invalidate queries, navigate back to `/profile`
- Back button navigation to `/profile`

### 2. `src/pages/SavedAddresses.tsx`
- Fetch addresses from `addresses` table where `user_id = auth.uid()`
- List view with edit/delete actions per address
- "Add Address" button opens inline form or dialog
- Form fields: Label, Street, City, State, Pincode
- CRUD operations: insert, update, delete on `addresses` table
- Back button navigation to `/profile`

### 3. `src/pages/Settings.tsx`
- Sections with navigation/toggles:
  - **Appearance**: Dark Mode toggle (Light / Dark / System) using `next-themes`
  - **Booking Management**: Link to `/bookings` for history; no separate page needed
  - **Notifications**: Toggle switches for booking updates, provider arrival, promotions (localStorage)
  - **Account**: Change password (sends reset email via `supabase.auth.resetPasswordForEmail`), Log out all devices (sign out), Delete account (confirmation dialog + edge function)
- Back button navigation to `/profile`

### 4. `src/components/profile/AvatarUpload.tsx`
- Small component for avatar display + file picker
- Uploads to `profile-photos` bucket
- Returns public URL to parent

## Modified Files

### 5. `src/pages/Profile.tsx`
- Wire menu actions: `navigate("/edit-profile")`, `navigate("/saved-addresses")`, `navigate("/settings")`
- Dynamic stats: fetch counts from `bookings` (where `customer_id`), `reviews` (where `customer_id`), `addresses` (where `user_id`)
- Fetch profile from `profiles` table for display name + avatar (instead of just auth metadata)

### 6. `src/App.tsx`
- Add routes: `/edit-profile`, `/saved-addresses`, `/settings` (all wrapped in `ProtectedRoute` inside `MobileLayout`)

### 7. `src/main.tsx` or `src/App.tsx`
- Wrap app with `ThemeProvider` from `next-themes` for dark mode support

## Implementation Details

**Theme switching**: `next-themes` is already installed. Wrap the app in `<ThemeProvider attribute="class" defaultTheme="system">`. The `.dark` class in `index.css` already defines dark mode variables.

**Avatar upload flow**: File input -> upload to `profile-photos/{userId}/avatar.{ext}` -> get public URL -> update `profiles.avatar_url`.

**Account deletion edge function**: `supabase/functions/delete-account/index.ts` -- uses service role key to delete the user from `auth.users`. This cascades to profiles and addresses via foreign keys. Bookings are preserved (no cascade).

**Password change**: Uses `supabase.auth.resetPasswordForEmail(email)` which sends a password reset link.

## Files Summary

| File | Action |
|------|--------|
| `src/pages/EditProfile.tsx` | New |
| `src/pages/SavedAddresses.tsx` | New |
| `src/pages/Settings.tsx` | New |
| `src/components/profile/AvatarUpload.tsx` | New |
| `supabase/functions/delete-account/index.ts` | New edge function |
| `src/pages/Profile.tsx` | Edit -- wire navigation + dynamic stats |
| `src/App.tsx` | Edit -- add routes + ThemeProvider |
| `src/main.tsx` | Edit -- possibly wrap ThemeProvider here |

