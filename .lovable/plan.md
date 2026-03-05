

# Fix: `has_role` Permission Denied Breaking All Queries

## Root Cause

Migration `20260305101552` contains:
```sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
```

But RLS policies like `"Admins can manage categories" FOR ALL USING (public.has_role(auth.uid(), 'admin'))` exist on `service_categories`. Postgres evaluates **all** SELECT policies (OR'd), so even though `"Anyone can read active categories"` exists, the admin `FOR ALL` policy also fires — and it calls `has_role`, which anon/authenticated can no longer execute. Result: 401 on every query.

## Fix (single migration)

1. **Grant EXECUTE on `has_role` back to `anon` and `authenticated`** — RLS policies require it. The function is `SECURITY DEFINER` so it's safe; it only returns a boolean. To prevent direct RPC abuse, the function can be excluded from the PostgREST API by ensuring it's not exposed (it won't be callable via `.rpc()` if we don't want it to be, but the real risk is minimal since it only checks if a role exists).

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
```

This single SQL statement in a new migration will fix all the 401 errors across `service_categories`, `provider_services`, `bookings`, and every other table whose RLS uses `has_role`.

## Secondary Bug

The `provider_services` request shows `category_id=eq.:categoryId` (literal string `:categoryId`). This means the `useProvidersByCategory` hook is passing the string `":categoryId"` instead of the actual UUID. Will check and fix the parameter passing in the hook.

