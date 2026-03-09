

## Fix Unread Badge: Mark Messages as Read

### Problem
1. Messages are never marked as read (`read_at` stays null), so the unread badge never decreases.
2. The unread count logic in `useUnreadCount` is correct (counts messages where `read_at IS NULL` and `sender_id != me`), but nothing ever sets `read_at`.

### Plan

#### 1. Mark messages as read when opening a conversation (`src/pages/Conversation.tsx`)
- Add a `useEffect` that runs when `messages` data loads (and on realtime updates).
- It calls `supabase.from("messages").update({ read_at: new Date().toISOString() })` for all messages in the current conversation where `sender_id != user.id` and `read_at IS NULL`.
- After marking, invalidate the unread count by triggering a re-fetch (the realtime subscription on `useUnreadCount` will handle this automatically since it listens to all `messages` changes).

#### 2. No database changes needed
The `messages` table already has a `read_at` column and an UPDATE RLS policy ("Participants can mark messages read") that allows conversation participants to update messages.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Conversation.tsx` | Add `useEffect` to mark incoming messages as read when the conversation is open |

