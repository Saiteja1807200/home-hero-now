import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details
  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    enabled: !!conversationId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, booking_id, customer_id, provider_id")
        .eq("id", conversationId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Resolve the other party's name
      const isCustomer = data.customer_id === user!.id;
      let otherName = "User";
      let otherAvatar = "";

      if (isCustomer) {
        // Get provider's user_id then profile
        const { data: sp } = await supabase
          .from("service_providers")
          .select("user_id")
          .eq("id", data.provider_id)
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
        // Provider viewing — get customer profile via security definer RPC
        const { data: profiles } = await supabase.rpc("get_customer_profile", {
          customer_user_id: data.customer_id,
        });
        const p = profiles?.[0];
        if (p) {
          otherName = p.full_name || "Customer";
          otherAvatar = p.avatar_url || "";
        }
      }

      return { ...data, otherName, otherAvatar, isCustomer };
    },
  });

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId && !!user,
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Message[]) ?? [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mark incoming messages as read
  useEffect(() => {
    if (!messages || !user || !conversationId) return;
    const unread = messages.filter(
      (m) => m.sender_id !== user.id && !(m as any).read_at
    );
    if (unread.length === 0) return;

    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null)
      .then();
  }, [messages, user, conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !conversationId || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (!error) {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
          <ArrowLeft size={20} />
        </Button>
        {conversation && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={conversation.otherAvatar} />
              <AvatarFallback className="text-xs bg-muted">
                {conversation.otherName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-display font-semibold text-sm text-foreground">
              {conversation.otherName}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-3/4 rounded-xl" />
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello!
          </p>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1 rounded-full"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="rounded-full shrink-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
