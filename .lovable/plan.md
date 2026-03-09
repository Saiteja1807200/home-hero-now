

## Enable Provider Messaging with Customers

### Problem
The Conversation page code already handles both roles, but two things are missing:
1. **No "Message" button** on the Provider Dashboard booking cards — providers have no way to initiate or navigate to a conversation.
2. **Profiles RLS blocks cross-user reads** — when a provider views a conversation, the code queries `profiles` for the customer's name/avatar, but RLS only allows reading your own profile. This will silently fail.

### Plan

#### 1. New Database Function: `get_customer_profile` (migration)
Create a `SECURITY DEFINER` RPC (like `get_provider_profile`) that safely returns a customer's `full_name` and `avatar_url` — only if the caller is a provider in a conversation with that customer.

```sql
CREATE FUNCTION public.get_customer_profile(customer_user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
```

#### 2. Provider Dashboard — Add "Message" button
In `src/pages/ProviderDashboard.tsx`:
- Add a `MessageCircle` "Message" button on active/completed booking cards.
- On click: check if a conversation exists for that booking; if not, create one (need an INSERT policy for providers on conversations — currently only customers can create). Navigate to `/messages/:conversationId`.

#### 3. New RLS Policy: Providers can create conversations
Add an INSERT policy on `conversations` allowing providers to create a conversation for their own bookings (matching `provider_id` to their `service_providers.id`).

#### 4. Update `Conversation.tsx` and `Messages.tsx`
Replace the direct `profiles` table query for customer info with the new `get_customer_profile` RPC call, so it works through the SECURITY DEFINER bypass.

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | `get_customer_profile` function + provider INSERT policy on conversations |
| `src/pages/ProviderDashboard.tsx` | Add "Message" button with conversation create/navigate logic |
| `src/pages/Conversation.tsx` | Use `get_customer_profile` RPC instead of direct profiles query |
| `src/pages/Messages.tsx` | Same RPC fix for customer name resolution |

