import LocationBar from "@/components/home/LocationBar";
import SearchBar from "@/components/home/SearchBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecommendedProviders from "@/components/home/RecommendedProviders";
import ActiveBookingCard from "@/components/home/ActiveBookingCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LocationBar />
      <SearchBar />
      <CategoryGrid />
      <ActiveBookingCard
        providerName="Rajesh Kumar"
        service="AC Servicing"
        status="on_the_way"
        time="Today, 2:30 PM"
      />
      <RecommendedProviders />
    </div>
  );
};

export default Index;
