

# Fix: Email OTP Verification Type

## Problem

On line 133 of `Auth.tsx`, the `verifyOtp` call uses `type: "signup"` when `isSignUp` is true. The `"signup"` type is meant for verifying magic link confirmation tokens, not 6-digit OTP codes. This causes verification to fail because Supabase looks for a different token type.

## Fix

**File: `src/pages/Auth.tsx`** (line 133)

Change:
```typescript
type: isSignUp ? "signup" : "email",
```
To:
```typescript
type: "email",
```

The `"email"` type is the correct verification type for email OTP codes in all cases (both new signups and returning sign-ins). Supabase's `signInWithOtp` with `shouldCreateUser: true` already handles account creation -- the verify step just needs to validate the 6-digit code.

This is a single-line fix. No other files need changes.

