

## Fix: Replace `has_role()` references in all RLS policies with `is_admin()`

### Root Cause

The migration `20260310120627` revoked `EXECUTE` on `has_role(uuid, app_role)` from `authenticated`. However, these RLS policies still call `has_role()` and are evaluated under the `authenticated` role context, causing every query to fail with error code `42501`:

| Table | Policy |
|-------|--------|
| `bookings` | Admins can read all bookings |
| `profiles` | Admins can read all profiles |
| `service_categories` | Admins can manage categories |
| `service_providers` | Admins can manage all providers |
| `reviews` | Admins can read all reviews |
| `system_logs` | Admins can read logs |
| `user_roles` | Admins can manage roles |

Additionally, **all policies are RESTRICTIVE** (`Permissive: No`). With no permissive policies, even non-admin SELECT policies (like "Anyone can read active categories") fail because PostgreSQL requires at least one permissive policy to grant base access.

### Fix (single migration)

1. **Drop and recreate each affected policy**, replacing `has_role(auth.uid(), 'admin'::app_role)` with `public.is_admin()`.

2. **Convert non-admin SELECT policies to PERMISSIVE** so they actually grant access. The affected tables:
   - `service_categories`: "Anyone can read active categories" must be PERMISSIVE
   - `provider_services`: "Anyone can read provider services" must be PERMISSIVE
   - `addresses`: "Users can CRUD own addresses" must be PERMISSIVE
   - `bookings`: customer/provider SELECT/INSERT/UPDATE policies must be PERMISSIVE
   - `conversations`: customer/provider policies must be PERMISSIVE
   - `messages`: participant policies must be PERMISSIVE
   - `profiles`: user read/update own profile must be PERMISSIVE
   - `reviews`: customer/provider read + customer create must be PERMISSIVE
   - `user_roles`: "Users can read own roles" must be PERMISSIVE

3. **Keep admin ALL/SELECT policies as RESTRICTIVE** is wrong too -- admin policies should be PERMISSIVE so admins can actually access data independently.

In summary: recreate all policies as **PERMISSIVE**, replacing `has_role(...)` with `is_admin()`.

### Files Changed

| File | Change |
|------|--------|
| New Supabase migration | Drop + recreate all affected RLS policies using `is_admin()` and correct permissiveness |

No frontend code changes needed.

