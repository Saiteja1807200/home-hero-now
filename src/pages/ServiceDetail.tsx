import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useProvidersByCategory } from "@/hooks/useProvidersByCategory";
import { ArrowLeft, Search, UserCheck, Star, BadgeCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { data: categories, isLoading: catLoading } = useServiceCategories();
  const { data: providers, isLoading: provLoading } = useProvidersByCategory(categoryId);

  const category = categories?.find((c) => c.id === categoryId);

  if (catLoading) {
    return (
      <div className="min-h-screen bg-background px-4 pt-16">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-muted-foreground">Service not found</p>
        <button onClick={() => navigate("/services")} className="text-sm font-semibold text-accent">
          ← Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 backdrop-blur-lg px-4 py-3 safe-top border-b border-border">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${category.color}22` }}
          >
            <category.icon size={18} style={{ color: category.color }} />
          </div>
          <h1 className="font-display text-lg font-bold text-foreground">{category.name}</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder={`Search ${category.name} providers...`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Providers list or empty state */}
      {provLoading ? (
        <div className="px-4 pt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : providers && providers.length > 0 ? (
        <div className="px-4 pt-4 space-y-3">
          {providers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted flex-shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                      {(p.full_name ?? "P")[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-semibold text-sm text-foreground truncate">{p.full_name}</h3>
                    {p.verified && <BadgeCheck size={14} style={{ color: category.color }} />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.experience_years} yrs experience · {p.coverage_area_km} km range
                  </p>
                  {p.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">₹{p.base_price}</span>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-8 px-4">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center gap-3 px-6 pt-20 text-center"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${category.color}22` }}
          >
            <UserCheck size={28} style={{ color: category.color }} />
          </div>
          <h2 className="font-display text-base font-bold text-foreground">No providers yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
            We're onboarding {category.name.toLowerCase()} providers in your area. Check back soon!
          </p>
        </motion.div>
      )}
    </div>
  );
}
