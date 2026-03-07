import { User, MapPin, Settings, LogOut, ChevronRight, Star, CalendarDays, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BrandHeader from "@/components/layout/BrandHeader";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch profile from DB
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Check if user is already a provider
  const { data: providerStatus } = useQuery({
    queryKey: ["my-provider-status", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("id, status")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Dynamic stats
  const { data: stats } = useQuery({
    queryKey: ["my-profile-stats", user?.id],
    queryFn: async () => {
      const [bookingsRes, reviewsRes, addressesRes] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("customer_id", user!.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("customer_id", user!.id),
        supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        bookings: bookingsRes.count ?? 0,
        reviews: reviewsRes.count ?? 0,
        addresses: addressesRes.count ?? 0,
      };
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest User";
  const initials = displayName.charAt(0).toUpperCase();
  const email = user?.email || "Sign in to manage your account";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      {/* Header */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
              {initials}
            </div>
          )}
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        {!user && (
          <Button
            className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold touch-target"
            onClick={() => navigate("/auth")}
          >
            Sign In / Register
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 px-4 py-3">
        {[
          { icon: CalendarDays, label: "Bookings", value: String(stats?.bookings ?? 0) },
          { icon: Star, label: "Reviews", value: String(stats?.reviews ?? 0) },
          { icon: MapPin, label: "Addresses", value: String(stats?.addresses ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex-1 rounded-xl border border-border bg-card p-3 text-center">
            <Icon size={18} className="mx-auto mb-1 text-muted-foreground" />
            <p className="font-display text-lg font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="mt-2 px-4">
        {[
          { icon: User, label: "Edit Profile", action: () => navigate("/edit-profile") },
          { icon: MapPin, label: "Saved Addresses", action: () => navigate("/saved-addresses") },
          ...(!providerStatus
            ? [{ icon: Briefcase, label: "Become a Provider", action: () => navigate("/become-provider") }]
            : [{ icon: Briefcase, label: `Provider Dashboard (${providerStatus.status})`, action: () => {} }]),
          { icon: Settings, label: "Settings", action: () => navigate("/settings") },
          ...(user ? [{ icon: LogOut, label: "Sign Out", action: handleSignOut }] : []),
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex w-full items-center gap-3 py-3.5 border-b border-border touch-target"
          >
            <Icon size={18} className="text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">{label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
