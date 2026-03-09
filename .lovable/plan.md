

## Add Account Deactivated Confirmation Page

### Plan

1. **Create `src/pages/AccountDeleted.tsx`** — A standalone page with a clean, centered layout showing:
   - A checkmark or shield icon
   - "Your account has been deactivated" heading
   - Brief message: "Your personal data has been removed. Booking and conversation history has been archived for platform records."
   - A "Return to Home" button linking to `/auth`

2. **Update `src/pages/Settings.tsx`** — Change `navigate("/auth")` to `navigate("/account-deleted")` after successful deletion.

3. **Update `src/App.tsx`** — Add route `/account-deleted` pointing to the new page (outside `MobileLayout` and `ProtectedRoute` since the user is logged out).

### Files Changed

| File | Change |
|------|--------|
| `src/pages/AccountDeleted.tsx` | New confirmation page with icon, message, and CTA |
| `src/pages/Settings.tsx` | Redirect to `/account-deleted` instead of `/auth` |
| `src/App.tsx` | Add `/account-deleted` route |

