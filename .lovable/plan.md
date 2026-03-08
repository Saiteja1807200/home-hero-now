

# Plan: Allow Re-signup After Account Deletion

## Problem
When a user deletes their account, `adminClient.auth.admin.deleteUser(userId)` by default performs a "soft delete" in Supabase — it marks the user as deleted but keeps the email reserved in `auth.users`. This prevents re-registration with the same email.

## Solution

One-line fix in the edge function: pass `shouldSoftDelete: false` to `deleteUser()` so the auth record is fully removed, freeing the email for future signups.

### File: `supabase/functions/delete-account/index.ts`

**Line 67** — Change:
```typescript
const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
```
To:
```typescript
const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId, false);
```

The second parameter (`shouldSoftDelete`) set to `false` ensures a hard delete, completely removing the user from `auth.users` and releasing their email/phone for re-registration.

No other changes needed.

