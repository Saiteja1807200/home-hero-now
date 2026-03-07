import { CalendarDays, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import BrandHeader from "@/components/layout/BrandHeader";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  type BookingStatus,
} from "@/lib/constants";

interface BookingRow {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  notes: string | null;
  created_at: string;
  provider_name: string;
  service_name: string;
  base_price: number;
}

export default function Bookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" as BookingStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
      return;
    }

    toast.success("Booking cancelled");
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["active-booking"] });
  };

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<BookingRow[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status, scheduled_date, scheduled_time, notes, created_at, provider_id, service_id")
        .eq("customer_id", user!.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const results: BookingRow[] = [];

      for (const b of data) {
        // Resolve provider name via safe RPC
        let providerName = "Provider";
        const { data: sp } = await supabase
          .from("service_providers")
          .select("user_id")
          .eq("id", b.provider_id)
          .maybeSingle();
        if (sp?.user_id) {
          const { data: profileRows } = await supabase
            .rpc("get_provider_profile", { provider_user_id: sp.user_id });
          const profile = profileRows?.[0] ?? null;
          if (profile?.full_name) providerName = profile.full_name;
        }

        // Resolve service name + price
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

        results.push({
          id: b.id,
          status: b.status as BookingStatus,
          scheduled_date: b.scheduled_date,
          scheduled_time: b.scheduled_time,
          notes: b.notes,
          created_at: b.created_at,
          provider_name: providerName,
          service_name: serviceName,
          base_price: basePrice,
        });
      }

      return results;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <div className="px-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">My Bookings</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-3 pb-24">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      {b.service_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {b.provider_name}
                    </p>
                  </div>
                  <Badge
                    className={`${BOOKING_STATUS_COLORS[b.status]} border-0 text-[10px] font-semibold`}
                  >
                    {BOOKING_STATUS_LABELS[b.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays size={14} />
                    <span>
                      {format(new Date(b.scheduled_date), "MMM d, yyyy")} · {b.scheduled_time}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{b.base_price}
                  </span>
                </div>
                {b.status === "requested" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <X size={14} className="mr-1" />
                        Cancel Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your {b.service_name} booking with {b.provider_name} on{" "}
                          {format(new Date(b.scheduled_date), "MMM d, yyyy")}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(b.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <CalendarDays size={28} className="text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">
              No bookings yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Book a service from our home screen and your bookings will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
