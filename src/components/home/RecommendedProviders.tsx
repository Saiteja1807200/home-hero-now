import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import ProviderCard from "./ProviderCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDialog from "@/components/booking/BookingDialog";

interface RecommendedProvider {
  providerId: string;
  serviceId: string;
  name: string;
  service: string;
  rating: number;
  jobs: number;
  distance: string;
  eta: string;
  verified: boolean;
  basePrice: number;
}

interface Props {
  selectedLocation: string;
}

export default function RecommendedProviders({ selectedLocation }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingProvider, setBookingProvider] = useState<RecommendedProvider | null>(null);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["recommended-providers", selectedLocation],
    queryFn: async () => {
      const { data: providerRows, error } = await supabase
        .from("public_providers")
        .select("id, user_id, verified, is_online, coverage_area")
        .eq("status", "approved")
        .eq("is_online", true)
        .eq("coverage_area" as string, selectedLocation)
        .limit(10) as { data: Array<{ id: string | null; user_id: string | null; verified: boolean | null; is_online: boolean | null; coverage_area: string | null }> | null; error: any };

      if (error) throw error;
      if (!providerRows || providerRows.length === 0) return [];

      const results: RecommendedProvider[] = [];

      for (const p of providerRows) {
        if (!p.user_id || !p.id) continue;

        const { data: profileRows } = await supabase
          .rpc("get_provider_profile", { provider_user_id: p.user_id });
        const profile = profileRows?.[0] ?? null;

        const { data: svc } = await supabase
          .from("provider_services")
          .select("id, category_id, base_price")
          .eq("provider_id", p.id)
          .limit(1)
          .maybeSingle();

        let serviceName = "Service";
        if (svc) {
          const { data: cat } = await supabase
            .from("service_categories")
            .select("name")
            .eq("id", svc.category_id)
            .single();
          if (cat?.name) serviceName = cat.name;
        }

        const { data: reviews } = await supabase
          .from("public_reviews")
          .select("quality, punctuality, cleanliness, professionalism")
          .eq("provider_id", p.id);

        let rating = 0;
        const jobs = reviews?.length ?? 0;
        if (reviews && reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => {
            return sum + ((r.quality ?? 0) + (r.punctuality ?? 0) + (r.cleanliness ?? 0) + (r.professionalism ?? 0)) / 4;
          }, 0) / reviews.length;
          rating = Math.round(avg * 10) / 10;
        }

        results.push({
          providerId: p.id,
          serviceId: svc?.id ?? "",
          name: profile?.full_name || "Provider",
          service: serviceName,
          rating,
          jobs,
          distance: "Nearby",
          eta: "~15 min",
          verified: p.verified ?? false,
          basePrice: svc?.base_price ?? 0,
        });
      }

      return results;
    },
  });

  const handleBookNow = (provider: RecommendedProvider) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBookingProvider(provider);
  };

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-3 px-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-44 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">Recommended</h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          <MapPin size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No providers currently available in this area.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">Recommended</h2>
        <button className="text-sm font-semibold text-accent">See All</button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none">
        {providers.map((p) => (
          <ProviderCard
            key={p.providerId}
            name={p.name}
            service={p.service}
            rating={p.rating}
            jobs={p.jobs}
            distance={p.distance}
            eta={p.eta}
            verified={p.verified}
            onBookNow={() => handleBookNow(p)}
          />
        ))}
      </div>

      {bookingProvider && (
        <BookingDialog
          open={!!bookingProvider}
          onOpenChange={(open) => !open && setBookingProvider(null)}
          providerId={bookingProvider.providerId}
          providerName={bookingProvider.name}
          serviceId={bookingProvider.serviceId}
          serviceName={bookingProvider.service}
          basePrice={bookingProvider.basePrice}
        />
      )}
    </section>
  );
}
