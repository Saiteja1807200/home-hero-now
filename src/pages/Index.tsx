import LocationBar from "@/components/home/LocationBar";
import SearchBar from "@/components/home/SearchBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecommendedProviders from "@/components/home/RecommendedProviders";
import ActiveBookingCard from "@/components/home/ActiveBookingCard";
import BrandHeader from "@/components/layout/BrandHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingStatus } from "@/lib/constants";

const Index = () => {
  const { user } = useAuth();

  const { data: activeBooking } = useQuery({
    queryKey: ["active-booking", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          scheduled_date,
          scheduled_time,
          service_id,
          provider_id
        `)
        .eq("customer_id", user!.id)
        .in("status", ["accepted", "on_the_way", "in_progress"])
        .order("scheduled_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch provider name via service_providers -> profiles
      const { data: provider } = await supabase
        .from("service_providers")
        .select("user_id")
        .eq("id", data.provider_id)
        .single();

      let providerName = "Provider";
      if (provider) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", provider.user_id)
          .single();
        if (profile?.full_name) providerName = profile.full_name;
      }

      // Fetch service name via provider_services -> service_categories
      const { data: providerService } = await supabase
        .from("provider_services")
        .select("category_id")
        .eq("id", data.service_id)
        .single();

      let serviceName = "Service";
      if (providerService) {
        const { data: category } = await supabase
          .from("service_categories")
          .select("name")
          .eq("id", providerService.category_id)
          .single();
        if (category?.name) serviceName = category.name;
      }

      return {
        providerName,
        service: serviceName,
        status: data.status as BookingStatus,
        time: `${data.scheduled_date}, ${data.scheduled_time}`,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <LocationBar />
      <SearchBar />
      <CategoryGrid />
      {activeBooking && (
        <ActiveBookingCard
          providerName={activeBooking.providerName}
          service={activeBooking.service}
          status={activeBooking.status}
          time={activeBooking.time}
        />
      )}
      <RecommendedProviders />
    </div>
  );
};

export default Index;
