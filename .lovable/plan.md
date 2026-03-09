

## Real-time Messaging Between Customers and Service Providers

### Overview
Add an in-app messaging system that lets customers chat with service providers linked to their bookings. Conversations appear in the Messages tab and can be initiated from booking cards.

### Database Changes (Migration)

**New table: `conversations`**
- `id` (uuid, PK)
- `booking_id` (uuid, FK → bookings, unique) — one conversation per booking
- `customer_id` (uuid, not null)
- `provider_id` (uuid, FK → service_providers, not null)
- `created_at` (timestamptz, default now())

**New table: `messages`**
- `id` (uuid, PK)
- `conversation_id` (uuid, FK → conversations)
- `sender_id` (uuid, not null) — auth user id
- `content` (text, not null)
- `created_at` (timestamptz, default now())
- `read_at` (timestamptz, nullable)

**RLS Policies:**
- `conversations`: Customers and providers can SELECT their own conversations (where `customer_id = auth.uid()` or provider's `user_id = auth.uid()` via join). Customers can INSERT (linked to their booking).
- `messages`: Participants can SELECT/INSERT messages for conversations they belong to. No UPDATE/DELETE.

**Realtime:** Enable realtime on `messages` table for live chat updates.

### Frontend Changes

1. **Bookings page** — Add a "Message" button on each booking card (for non-cancelled bookings) that navigates to `/messages/:conversationId`. If no conversation exists yet, create one on click.

2. **Messages page (conversation list)** — Replace the empty state with a list of conversations fetched from `conversations` joined with provider profile (via RPC) and last message preview. Each item shows provider name, avatar, last message snippet, and timestamp.

3. **New: Conversation page (`/messages/:conversationId`)** — A chat view with:
   - Header showing provider/customer name and back arrow
   - Scrollable message list (own messages right-aligned, theirs left-aligned)
   - Text input + send button at bottom
   - Supabase Realtime subscription for new messages
   - Auto-scroll to latest message

4. **Route** — Add `/messages/:conversationId` route in App.tsx as a protected route inside MobileLayout.

5. **Unread indicator** (optional) — Badge on the Messages nav icon showing unread count.

### File Plan

| File | Action |
|------|--------|
| Migration SQL | Create `conversations` + `messages` tables with RLS |
| `src/pages/Messages.tsx` | Rewrite to show conversation list |
| `src/pages/Conversation.tsx` | New chat UI page |
| `src/pages/Bookings.tsx` | Add "Message" button per booking |
| `src/App.tsx` | Add `/messages/:conversationId` route |

### Technical Notes
- Provider identity resolved via `get_provider_profile` RPC (no PII leakage)
- Messages use Supabase Realtime channel subscription filtered by `conversation_id`
- Conversation is created lazily (only when user first messages from a booking)

