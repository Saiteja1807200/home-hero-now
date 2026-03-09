import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import BrandHeader from "@/components/layout/BrandHeader";
import { formatDistanceToNow } from "date-fns";

interface ConversationItem {
  id: string;
  otherName: string;
  otherAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["my-conversations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ConversationItem[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, customer_id, provider_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const results: ConversationItem[] = [];

      for (const c of data) {
        const isCustomer = c.customer_id === user!.id;
        let otherName = "User";
        let otherAvatar = "";

        if (isCustomer) {
          const { data: sp } = await supabase
            .from("service_providers")
            .select("user_id")
            .eq("id", c.provider_id)
            .maybeSingle();
          if (sp?.user_id) {
            const { data: profiles } = await supabase.rpc("get_provider_profile", {
              provider_user_id: sp.user_id,
            });
            const p = profiles?.[0];
            if (p) {
              otherName = p.full_name || "Provider";
              otherAvatar = p.avatar_url || "";
            }
          }
        } else {
          // Provider viewing — use security definer RPC
          const { data: profiles } = await supabase.rpc("get_customer_profile", {
            customer_user_id: c.customer_id,
          });
          const p = profiles?.[0];
          if (p) {
            otherName = p.full_name || "Customer";
            otherAvatar = p.avatar_url || "";
          }
        }

        // Get last message
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMsg = msgs?.[0];

        results.push({
          id: c.id,
          otherName,
          otherAvatar,
          lastMessage: lastMsg?.content ?? "No messages yet",
          lastMessageAt: lastMsg?.created_at ?? c.created_at,
        });
      }

      // Sort by last message time
      results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      return results;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <div className="px-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Messages</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-2 pb-24">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={c.otherAvatar} />
                  <AvatarFallback className="bg-muted text-xs">
                    {c.otherName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-foreground truncate">
                      {c.otherName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {c.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <MessageCircle size={28} className="text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">No messages</h2>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Start a conversation from your bookings and it will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
