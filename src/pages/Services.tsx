import { useServiceCategories } from "@/hooks/useServiceCategories";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Services() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: categories, isLoading } = useServiceCategories();

  const filtered = (categories ?? []).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 safe-top">
        <h1 className="font-display text-xl font-bold text-foreground mb-3">All Services</h1>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 mb-4">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 px-4 pb-24">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))
          : filtered.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/services/${cat.id}`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm active:scale-95 transition-transform"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <cat.icon size={22} style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
              </motion.button>
            ))}
      </div>
    </div>
  );
}
