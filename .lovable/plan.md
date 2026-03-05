

# Add Provider Registration Flow

## Current State
- Users can sign up and get a `profiles` row automatically
- There is **no UI or flow** for a user to become a service provider
- Provider data currently exists only via direct database seeding

## What to Build

### 1. "Become a Provider" page (`/become-provider`)
- Form fields: bio, experience years, coverage area
- Select which service categories they offer (multi-select from `service_categories`)
- Set a base price per selected category
- Submit creates a row in `service_providers` (status: `pending`) and rows in `provider_services`

### 2. Profile page link
- Add a "Become a Provider" button on the Profile page (only shown if user is not already a provider)
- If already a provider, show "Provider Dashboard" link instead

### 3. Database considerations
- `service_providers` table already has an INSERT-compatible RLS gap: no INSERT policy exists for regular users
- Need a new RLS policy: `"Users can create own provider profile" FOR INSERT WITH CHECK (auth.uid() = user_id)`
- `provider_services` similarly needs an INSERT policy for the provider owner
- Provider status starts as `pending` — admin approval required before they appear publicly

### 4. Route and protection
- Add `/become-provider` route wrapped in `ProtectedRoute` (must be logged in)
- After submission, show confirmation that profile is pending review

## Technical Details

**New migration** (2 RLS policies):
```sql
CREATE POLICY "Users can create own provider"
ON service_providers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can insert own services"
ON provider_services FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM service_providers
  WHERE id = provider_services.provider_id
  AND user_id = auth.uid()
));
```

**New file**: `src/pages/BecomeProvider.tsx` — form with bio, experience, category/price selection, submit handler.

**Edit**: `src/pages/Profile.tsx` — add "Become a Provider" button.
**Edit**: `src/App.tsx` — add route.

