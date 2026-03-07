

## Improve Provider Registration Form

### What Changes

The existing `BecomeProvider.tsx` form will be enhanced with auto-filled profile fields, simplified to a single primary category dropdown, and improved validation. No database schema changes needed -- the existing `service_providers` + `provider_services` tables already support everything.

### Important Note on "Role Update"
The user requested updating a `role` column on `profiles`, but the project correctly uses a separate `user_roles` table per security best practices. The `app_role` enum only has `admin`, `moderator`, `user` -- there is no `provider` value. Since provider status is already tracked via the `service_providers` table (and the Profile page already checks for it), no role table changes are needed. The existing `providerStatus` check on the Profile page already handles showing/hiding the "Become a Provider" option.

---

### Changes to `src/pages/BecomeProvider.tsx`

1. **Auto-fill fields**: Fetch the user's profile (`full_name`, `phone`, `avatar_url`) on mount and pre-populate form fields for Full Name and Phone Number (editable).

2. **Simplify category selection**: Replace multi-category checkbox grid with a single dropdown (`Select` component) for "Primary Service Category".

3. **Add Base Price field**: Single number input for base service price (replaces per-category pricing).

4. **Update validation schema**:
   - `experience_years`: min changed from 0 to 1
   - `base_price`: required, must be > 0
   - `full_name`: required string
   - `phone`: required string
   - Remove `coverage_area_km` (keep coverage_area dropdown)

5. **Optional photo upload**: Add `AvatarUpload` component (already exists at `src/components/profile/AvatarUpload.tsx`) at top of form. On upload, update the profile's `avatar_url`.

6. **Duplicate check**: Before showing the form, check if `service_providers` record exists for user. If yes, show "You are already registered as a provider" message with a back button (instead of the form).

7. **Success message**: Change to "You are now registered as a service provider." and auto-redirect to `/profile`.

8. **Invalidate queries**: After successful submission, invalidate `my-provider-status` so Profile page updates immediately.

### Changes to `src/pages/Profile.tsx`

- Already handles provider status display correctly. No changes needed -- `providerStatus` query already shows "Provider Dashboard" when a record exists and hides "Become a Provider".

### Files Changed
| File | Change |
|------|--------|
| `src/pages/BecomeProvider.tsx` | Rewrite form with auto-fill, single category dropdown, base price, avatar upload, duplicate guard, improved validation |

