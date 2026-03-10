import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import BrandHeader from "@/components/layout/BrandHeader";

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("is_admin");
      return data === true;
    },
    enabled: !!user,
  });

  const { data: pendingProviders, isLoading } = useQuery({
    queryKey: ["pending-providers"],
    queryFn: async () => {
      const { data: providers, error } = await supabase
        .from("service_providers")
        .select("id, bio, experience_years, coverage_area, coverage_area_km, city, user_id, status")
        .in("status", ["pending"]);
      if (error) throw error;
      if (!providers?.length) return [];

      const userIds = providers.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      return providers.map((p) => ({
        ...p,
        profile: profileMap.get(p.user_id),
      }));
    },
    enabled: isAdmin === true,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, userId }: { id: string; status: "approved" | "rejected"; userId: string }) => {
      const { error } = await supabase
        .from("service_providers")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      // Send approval/rejection notification email
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      await supabase.functions.invoke("notify-provider-approval", {
        body: { provider_user_id: userId, status },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["pending-providers"] });
      toast({ title: status === "approved" ? "Provider approved & notified" : `Provider ${status}` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (checkingRole || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <div className="px-4 pb-24">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Provider Approvals</h1>

        {!pendingProviders?.length ? (
          <p className="text-muted-foreground text-sm">No pending providers.</p>
        ) : (
          <div className="space-y-3">
            {pendingProviders.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {p.profile?.full_name || "Unknown"}
                    </CardTitle>
                    <Badge variant="outline">{p.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.profile?.email}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Experience: {p.experience_years} yrs · City: {p.city}</p>
                    <p>Coverage: {p.coverage_area_km} km — {p.coverage_area}</p>
                    {p.bio && <p className="italic">"{p.bio}"</p>}
                  </div>
                  <div className="flex gap-2 pt-1">
                     <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "approved", userId: p.user_id })}
                      disabled={updateStatus.isPending}
                    >
                      <ShieldCheck size={16} className="mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "rejected", userId: p.user_id })}
                      disabled={updateStatus.isPending}
                    >
                      <ShieldX size={16} className="mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
