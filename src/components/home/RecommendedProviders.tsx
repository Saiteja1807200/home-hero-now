import ProviderCard from "./ProviderCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedProvider {
  name: string;
  service: string;
  rating: number;
  jobs: number;
  distance: string;
  eta: string;
  verified: boolean;
}

export default function RecommendedProviders() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ["recommended-providers"],
    queryFn: async () => {
      // Fetch approved, online providers
      const { data: providerRows, error } = await supabase
        .from("public_providers")
        .select("id, user_id, verified, is_online")
        .eq("status", "approved")
        .eq("is_online", true)
        .limit(10);

      if (error) throw error;
      if (!providerRows || providerRows.length === 0) return [];

      const results: RecommendedProvider[] = [];

      for (const p of providerRows) {
        if (!p.user_id || !p.id) continue;

        // Get profile name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", p.user_id)
          .single();

        // Get first service category name
        const { data: svc } = await supabase
          .from("provider_services")
          .select("category_id")
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

        // Get review stats
        const { data: reviews } = await supabase
          .from("reviews")
          .select("quality, punctuality, cleanliness, professionalism")
          .eq("provider_id", p.id);

        let rating = 0;
        const jobs = reviews?.length ?? 0;
        if (reviews && reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => {
            return sum + (r.quality + r.punctuality + r.cleanliness + r.professionalism) / 4;
          }, 0) / reviews.length;
          rating = Math.round(avg * 10) / 10;
        }

        results.push({
          name: profile?.full_name || "Provider",
          service: serviceName,
          rating,
          jobs,
          distance: "Nearby",
          eta: "~15 min",
          verified: p.verified ?? false,
        });
      }

      return results;
    },
  });

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

  if (!providers || providers.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">Recommended</h2>
        <button className="text-sm font-semibold text-accent">See All</button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none">
        {providers.map((p) => (
          <ProviderCard key={p.name} {...p} />
        ))}
      </div>
    </section>
  );
}
