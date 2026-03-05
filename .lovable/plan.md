

# Fix: Category Tap Does Nothing Visible

## Problem
Tapping a category navigates to `/services/:categoryId`, but the `Services` component ignores the `categoryId` route param. The page looks identical whether you're on `/services` or `/services/electrician` — so it feels like nothing happened.

## Solution
Create a new `ServiceDetail` page that shows when a specific category is tapped. This page will:

1. **Read `categoryId` from URL params** and look up the category info (name, icon, color) from the seeded `service_categories` table or the local constants
2. **Display the category header** with icon, name, and a back button
3. **Show a "providers coming soon" placeholder** (since no real providers exist yet) — or query `public_providers` view joined with `provider_services` to list any matching providers
4. **Include a search/filter area** for future use

## Files to Create/Edit

- **Create `src/pages/ServiceDetail.tsx`** — New page component that:
  - Uses `useParams()` to get `categoryId`
  - Matches it against `SERVICE_CATEGORIES` constants for icon/color
  - Shows category name, back button, and a list of providers (empty state for now)
  
- **Edit `src/App.tsx`** — Point `/services/:categoryId` to the new `ServiceDetail` component instead of `Services`

This keeps `/services` as the "all categories" grid, and `/services/electrician` as the detail view for that category.

