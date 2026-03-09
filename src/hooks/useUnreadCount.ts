import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      // Get all conversation IDs where user is a participant
      const { data: convos } = await supabase
        .from("conversations")
        .select("id");

      if (!convos || convos.length === 0) {
        setCount(0);
        return;
      }

      const ids = convos.map((c) => c.id);

      // Count unread messages (not sent by me, read_at is null)
      const { count: unread } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .neq("sender_id", user.id)
        .is("read_at", null);

      setCount(unread ?? 0);
    };

    fetchCount();

    // Subscribe to new messages for live updates
    const channel = supabase
      .channel("unread-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}
