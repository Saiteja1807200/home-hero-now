import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background px-4 pt-4 safe-top">
      <h1 className="font-display text-xl font-bold text-foreground mb-6">Messages</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <MessageCircle size={28} className="text-muted-foreground" />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">No messages</h2>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Your conversations with service providers will show up here.
        </p>
      </div>
    </div>
  );
}
