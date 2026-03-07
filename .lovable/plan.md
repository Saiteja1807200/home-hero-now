

## Location Dropdown + Location-Based Provider Filtering

### Overview
Add a `coverage_area` text column to `service_providers`, update the `public_providers` view to expose it, turn `LocationBar` into a dropdown selector with scrollable Mancherial-area locations, and filter recommended providers by the selected location.

---

### 1. Database Migration

Add `coverage_area` and `city` columns to `service_providers`, recreate the `public_providers` view to include them, and update existing sample providers with location data.

```sql
-- Add columns
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS coverage_area text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'Mancherial';

-- Recreate view to include new columns
DROP VIEW IF EXISTS public.public_providers;
CREATE VIEW public.public_providers WITH (security_invoker = on) AS
  SELECT id, user_id, experience_years, bio, verified, is_online,
         coverage_area_km, coverage_area, city, status, created_at
  FROM public.service_providers
  WHERE status = 'approved';

-- Update existing 5 providers with coverage areas
UPDATE service_providers SET coverage_area = 'Mancherial Town Center', city = 'Mancherial'
  WHERE id = 'a1000000-0000-0000-0000-000000000001';
UPDATE service_providers SET coverage_area = 'Bellampally Chowrasta', city = 'Mancherial'
  WHERE id = 'a1000000-0000-0000-0000-000000000002';
UPDATE service_providers SET coverage_area = 'Rajiv Nagar', city = 'Mancherial'
  WHERE id = 'a1000000-0000-0000-0000-000000000003';
UPDATE service_providers SET coverage_area = 'Gandhi Nagar', city = 'Mancherial'
  WHERE id = 'a1000000-0000-0000-0000-000000000004';
UPDATE service_providers SET coverage_area = 'Naspur', city = 'Mancherial'
  WHERE id = 'a1000000-0000-0000-0000-000000000005';
```

### 2. Insert Additional Sample Providers

A second migration (data-only via insert tool) will add 10 more providers distributed across the remaining Mancherial locations. This requires:
- Creating 10 new auth users/profiles (or using the insert tool to add profiles + service_providers + provider_services rows with deterministic UUIDs).
- Each new provider mapped to a unique coverage_area from the list (Ramakrishnapur, Indaram, Bheemaram, Chennur, Luxettipet, Mandamarri, Jaipur, Thandur, Devapur, Dandepally).

*Note: Creating auth users programmatically isn't possible via migrations. The 10 additional sample providers will be added as profile + service_provider + provider_service rows using deterministic UUIDs via the insert tool, with names matching the user's spec.*

### 3. Location State Management

Create a simple React context or use `localStorage` + React state in `Index.tsx`:

- **`src/lib/constants.ts`**: Export the `MANCHERIAL_LOCATIONS` array (20 items).
- **`src/components/home/LocationBar.tsx`**: Accept `selectedLocation` and `onLocationChange` props. Render a Popover (or DropdownMenu) with a ScrollArea containing the 20 locations. Max height ~400px so it scrolls on mobile.

### 4. LocationBar Component Update

Replace the static button with:
```
<Popover>
  <PopoverTrigger> (existing MapPin + label + chevron) </PopoverTrigger>
  <PopoverContent>
    <ScrollArea className="max-h-[300px]">
      {MANCHERIAL_LOCATIONS.map(loc => (
        <button onClick={() => onSelect(loc)}>{loc}</button>
      ))}
    </ScrollArea>
  </PopoverContent>
</Popover>
```

Display the selected location name (default: "Mancherial Town Center"). Persist selection in `localStorage`.

### 5. Index.tsx Changes

- Manage `selectedLocation` state with `localStorage` persistence.
- Pass `selectedLocation` and setter to `LocationBar`.
- Pass `selectedLocation` to `RecommendedProviders`.

### 6. RecommendedProviders Update

- Accept `selectedLocation` prop.
- Add it to the `queryKey`: `["recommended-providers", selectedLocation]`.
- Filter the `public_providers` query: `.eq("coverage_area", selectedLocation)`.
- When no providers found, show "No providers currently available in this area." instead of returning `null`.

### 7. BecomeProvider Form Update

Add a `coverage_area` select field to the provider registration form so new providers can pick their service area from `MANCHERIAL_LOCATIONS`.

---

### Files Changed
| File | Change |
|------|--------|
| Migration SQL | Add `coverage_area`, `city` columns; recreate view; update existing data |
| Insert SQL | Add 10 new sample providers with profiles + services |
| `src/lib/constants.ts` | Add `MANCHERIAL_LOCATIONS` array |
| `src/components/home/LocationBar.tsx` | Popover dropdown with ScrollArea |
| `src/pages/Index.tsx` | Location state + localStorage + pass to children |
| `src/components/home/RecommendedProviders.tsx` | Filter by `coverage_area`, empty state message |
| `src/pages/BecomeProvider.tsx` | Add coverage_area select field |

