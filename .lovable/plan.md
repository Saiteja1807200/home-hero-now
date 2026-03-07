

## Add Admin Provider Approval System

There is currently no way to approve providers. Here's the plan:

### 1. Create an Admin Dashboard page (`src/pages/AdminDashboard.tsx`)

A simple page accessible at `/admin` that:
- Checks if the current user has the `admin` role via `has_role` RPC
- Lists all providers with `status = 'pending'` (querying `service_providers` joined with profiles)
- Shows provider name, category, experience, coverage area, bio
- Provides **Approve** and **Reject** buttons for each provider

### 2. Admin approval mechanism

Since the RLS policy on `service_providers` prevents owners from changing their own `status`, we need an approach for admins:
- The existing RLS policy "Admins can manage all providers" (`has_role(auth.uid(), 'admin')`) already grants full access to admins
- The admin page will call `supabase.from('service_providers').update({ status: 'approved' }).eq('id', providerId)` directly

### 3. Add route in `App.tsx`

Add `/admin` route pointing to `AdminDashboard`, protected by `ProtectedRoute`.

### 4. How to make a user an admin

You'll need to insert a row into `user_roles` for your user:
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('<your-user-uuid>', 'admin');
```
This can be done via the Supabase SQL Editor.

### 5. Add admin access from Profile page

Show an "Admin Panel" menu item on the Profile page only if the user has the admin role (query `user_roles` table).

### Files Changed
| File | Change |
|------|--------|
| `src/pages/AdminDashboard.tsx` | New page with pending provider list + approve/reject |
| `src/App.tsx` | Add `/admin` route |
| `src/pages/Profile.tsx` | Add "Admin Panel" menu item for admin users |

