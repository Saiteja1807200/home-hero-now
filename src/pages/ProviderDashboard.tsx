import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Power,
  CheckCircle2,
  Clock,
  MapPin,
  IndianRupee,
  Star,
  Briefcase,
  Navigation,
  Play,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  type BookingStatus,
} from "@/lib/constants";

interface DashboardBooking {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  notes: string | null;
  customer_id: string;
  customer_name: string;
  service_name: string;
  base_price: number;
  address_label: string;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [togglingOnline, setTogglingOnline] = useState(false);

  // Fetch provider record
  const { data: provider, isLoading: provLoading } = useQuery({
    queryKey: ["my-provider", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("id, is_online, status, experience_years, bio, coverage_area")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch provider bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["provider-bookings", provider?.id],
    enabled: !!provider?.id,
    queryFn: async (): Promise<DashboardBooking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status, scheduled_date, scheduled_time, notes, customer_id, service_id, address_id")
        .eq("provider_id", provider!.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const results: DashboardBooking[] = [];

      for (const b of data) {
        // Customer name
        let customerName = "Customer";
        const { data: custProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", b.customer_id)
          .maybeSingle();
        if (custProfile?.full_name) customerName = custProfile.full_name;

        // Service name + price
        let serviceName = "Service";
        let basePrice = 0;
        const { data: ps } = await supabase
          .from("provider_services")
          .select("category_id, base_price")
          .eq("id", b.service_id)
          .maybeSingle();
        if (ps) {
          basePrice = ps.base_price;
          const { data: cat } = await supabase
            .from("service_categories")
            .select("name")
            .eq("id", ps.category_id)
            .maybeSingle();
          if (cat?.name) serviceName = cat.name;
        }

        // Address
        let addressLabel = "No address";
        if (b.address_id) {
          const { data: addr } = await supabase
            .from("addresses")
            .select("label, street")
            .eq("id", b.address_id)
            .maybeSingle();
          if (addr) addressLabel = `${addr.label} – ${addr.street}`;
        }

        results.push({
          id: b.id,
          status: b.status as BookingStatus,
          scheduled_date: b.scheduled_date,
          scheduled_time: b.scheduled_time,
          notes: b.notes,
          customer_id: b.customer_id,
          customer_name: customerName,
          service_name: serviceName,
          base_price: basePrice,
          address_label: addressLabel,
        });
      }

      return results;
    },
  });

  // Earnings & stats
  const completedBookings = bookings?.filter((b) => b.status === "completed") ?? [];
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.base_price, 0);

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ["provider-avg-rating", provider?.id],
    enabled: !!provider?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("public_reviews")
        .select("quality, punctuality, professionalism, cleanliness")
        .eq("provider_id", provider!.id);
      if (!data || data.length === 0) return 0;
      const total = data.reduce((sum, r) => {
        const avg = ((r.quality ?? 0) + (r.punctuality ?? 0) + (r.professionalism ?? 0) + (r.cleanliness ?? 0)) / 4;
        return sum + avg;
      }, 0);
      return Number((total / data.length).toFixed(1));
    },
  });

  const toggleOnline = async () => {
    if (!provider) return;
    setTogglingOnline(true);
    const { error } = await supabase
      .from("service_providers")
      .update({ is_online: !provider.is_online })
      .eq("id", provider.id);
    if (error) {
      toast.error("Failed to update availability");
    } else {
      toast.success(provider.is_online ? "You are now offline" : "You are now online");
      queryClient.invalidateQueries({ queryKey: ["my-provider"] });
    }
    setTogglingOnline(false);
  };

  const handleMessage = async (booking: DashboardBooking) => {
    if (!provider) return;
    // Check if conversation exists for this booking
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("booking_id", booking.id)
      .maybeSingle();

    if (existing) {
      navigate(`/messages/${existing.id}`);
      return;
    }

    // Create conversation
    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({
        booking_id: booking.id,
        customer_id: booking.customer_id,
        provider_id: provider.id,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to start conversation");
      return;
    }
    navigate(`/messages/${conv.id}`);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error(error.message || "Failed to update booking");
      return;
    }

    toast.success(`Booking ${BOOKING_STATUS_LABELS[newStatus].toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
  };

  const isLoading = provLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 bg-background">
        <p className="text-muted-foreground">No provider profile found.</p>
        <Button onClick={() => navigate("/profile")}>Back to Profile</Button>
      </div>
    );
  }

  const requestedBookings = bookings?.filter((b) => b.status === "requested") ?? [];
  const activeBookings = bookings?.filter((b) =>
    ["accepted", "on_the_way", "in_progress"].includes(b.status)
  ) ?? [];

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 py-3">
        <button onClick={() => navigate("/profile")} className="touch-target">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">Provider Dashboard</h1>
        {provider.status !== "approved" && (
          <Badge variant="secondary" className="text-[10px]">
            {provider.status}
          </Badge>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Availability Toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Power size={18} className={provider.is_online ? "text-green-500" : "text-muted-foreground"} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {provider.is_online ? "Online" : "Offline"}
              </p>
              <p className="text-xs text-muted-foreground">
                {provider.is_online ? "Visible to customers" : "Hidden from search"}
              </p>
            </div>
          </div>
          <Switch
            checked={provider.is_online}
            onCheckedChange={toggleOnline}
            disabled={togglingOnline}
          />
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CheckCircle2, label: "Completed", value: String(completedBookings.length) },
            { icon: IndianRupee, label: "Earnings", value: `₹${totalEarnings}` },
            { icon: Star, label: "Rating", value: avgRating ? String(avgRating) : "N/A" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
              <Icon size={16} className="mx-auto mb-1 text-muted-foreground" />
              <p className="font-display text-base font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="requests" className="text-xs">
              Requests {requestedBookings.length > 0 && `(${requestedBookings.length})`}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active {activeBookings.length > 0 && `(${activeBookings.length})`}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Done {completedBookings.length > 0 && `(${completedBookings.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-3 space-y-3">
            {requestedBookings.length === 0 ? (
              <EmptyState icon={Clock} message="No pending requests" />
            ) : (
              requestedBookings.map((b) => (
                <BookingCard key={b.id} booking={b}>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => updateBookingStatus(b.id, "accepted")}
                    >
                      <Check size={14} className="mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => updateBookingStatus(b.id, "cancelled")}
                    >
                      <X size={14} className="mr-1" /> Decline
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-1"
                    onClick={() => handleMessage(b)}
                  >
                    <MessageCircle size={14} className="mr-1" /> Message
                  </Button>
                </BookingCard>
              ))
            )}
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active" className="mt-3 space-y-3">
            {activeBookings.length === 0 ? (
              <EmptyState icon={Briefcase} message="No active jobs" />
            ) : (
              activeBookings.map((b) => (
                <BookingCard key={b.id} booking={b}>
                  <div className="mt-3">
                    {b.status === "accepted" && (
                      <Button size="sm" className="w-full" onClick={() => updateBookingStatus(b.id, "on_the_way")}>
                        <Navigation size={14} className="mr-1" /> Start Travel
                      </Button>
                    )}
                    {b.status === "on_the_way" && (
                      <Button size="sm" className="w-full" onClick={() => updateBookingStatus(b.id, "in_progress")}>
                        <Play size={14} className="mr-1" /> Start Service
                      </Button>
                    )}
                    {b.status === "in_progress" && (
                      <Button size="sm" className="w-full" onClick={() => updateBookingStatus(b.id, "completed")}>
                        <CheckCircle2 size={14} className="mr-1" /> Complete Service
                      </Button>
                    )}
                  </div>
                </BookingCard>
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="mt-3 space-y-3">
            {completedBookings.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="No completed jobs yet" />
            ) : (
              completedBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function BookingCard({
  booking,
  children,
}: {
  booking: DashboardBooking;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-display font-semibold text-sm text-foreground">{booking.service_name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{booking.customer_name}</p>
        </div>
        <Badge className={`${BOOKING_STATUS_COLORS[booking.status]} border-0 text-[10px] font-semibold`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
        <Clock size={12} />
        <span>
          {format(new Date(booking.scheduled_date), "MMM d, yyyy")} · {booking.scheduled_time}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
        <MapPin size={12} />
        <span className="truncate">{booking.address_label}</span>
      </div>
      <div className="flex items-center justify-end mt-2">
        <span className="text-sm font-semibold text-foreground">₹{booking.base_price}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon size={28} className="text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
