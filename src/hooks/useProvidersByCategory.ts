import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProviderWithProfile {
  id: string;
  bio: string | null;
  experience_years: number;
  verified: boolean;
  is_online: boolean;
  coverage_area_km: number;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  base_price: number;
  service_id: string;
}

async function fetchProviders(categoryId: string): Promise<ProviderWithProfile[]> {
  // Get provider_services for this category, join with provider + profile
  const { data: services, error: svcErr } = await supabase
    .from("provider_services")
    .select("id, base_price, provider_id, category_id")
    .eq("category_id", categoryId);

  if (svcErr) throw svcErr;
  if (!services || services.length === 0) return [];

  const providerIds = [...new Set(services.map((s) => s.provider_id))];

  // Fetch approved providers from public_providers view
  const { data: providers, error: provErr } = await supabase
    .from("public_providers")
    .select("id, bio, experience_years, verified, is_online, coverage_area_km, user_id, status")
    .in("id", providerIds)
    .eq("status", "approved");

  if (provErr) throw provErr;
  if (!providers || providers.length === 0) return [];

  // Fetch profiles for those users
  const userIds = providers.map((p) => p.user_id).filter(Boolean) as string[];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const serviceMap = new Map(services.map((s) => [s.provider_id, s]));

  return providers.map((p) => {
    const profile = profileMap.get(p.user_id!);
    const svc = serviceMap.get(p.id!);
    return {
      id: p.id!,
      bio: p.bio,
      experience_years: p.experience_years ?? 0,
      verified: p.verified ?? false,
      is_online: p.is_online ?? false,
      coverage_area_km: p.coverage_area_km ?? 10,
      user_id: p.user_id!,
      full_name: profile?.full_name ?? "Provider",
      avatar_url: profile?.avatar_url ?? null,
      base_price: svc?.base_price ?? 0,
      service_id: svc?.id ?? "",
    };
  });
}

export function useProvidersByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["providers-by-category", categoryId],
    queryFn: () => fetchProviders(categoryId!),
    enabled: !!categoryId,
  });
}
