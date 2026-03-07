

## Fix: Profile Bookings Count Should Exclude Cancelled Bookings

### Problem
The Profile page counts **all** bookings (including cancelled ones). It should only count active/non-cancelled bookings, so when a user cancels a booking, the count decreases.

### Change

**`src/pages/Profile.tsx`** (line 46): Add `.neq("status", "cancelled")` to the bookings count query, matching the same filter used in the Bookings tab.

```typescript
supabase.from("bookings").select("id", { count: "exact", head: true })
  .eq("customer_id", user!.id)
  .neq("status", "cancelled")
```

Also invalidate the `my-profile-stats` query key from `Bookings.tsx` after cancellation so the count updates immediately without requiring a page refresh.

**`src/pages/Bookings.tsx`**: Add `queryClient.invalidateQueries({ queryKey: ["my-profile-stats"] })` inside `handleCancel` after successful cancellation.

