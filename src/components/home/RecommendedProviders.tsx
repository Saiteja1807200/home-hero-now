import ProviderCard from "./ProviderCard";

const MOCK_PROVIDERS = [
  { name: "Rajesh Kumar", service: "Electrician", rating: 4.8, jobs: 234, distance: "1.2 km", eta: "15 min", verified: true },
  { name: "Amit Singh", service: "Plumber", rating: 4.6, jobs: 189, distance: "2.1 km", eta: "20 min", verified: true },
  { name: "Suresh Patel", service: "AC Repair", rating: 4.9, jobs: 312, distance: "0.8 km", eta: "10 min", verified: true },
  { name: "Vikram Sharma", service: "Carpenter", rating: 4.7, jobs: 156, distance: "3.0 km", eta: "25 min", verified: false },
];

export default function RecommendedProviders() {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">Recommended</h2>
        <button className="text-sm font-semibold text-accent">See All</button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none">
        {MOCK_PROVIDERS.map((p) => (
          <ProviderCard key={p.name} {...p} />
        ))}
      </div>
    </section>
  );
}
