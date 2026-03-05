import { useServiceCategories } from "@/hooks/useServiceCategories";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryGrid() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useServiceCategories();

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 font-display text-lg font-bold text-foreground">Services</h2>
      <div className="grid grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
            ))
          : categories?.slice(0, 8).map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => navigate(`/services/${cat.id}`)}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <cat.icon size={24} style={{ color: cat.color }} />
                </div>
                <span className="text-[11px] font-medium leading-tight text-center text-foreground">
                  {cat.name}
                </span>
              </motion.button>
            ))}
      </div>

      <button
        onClick={() => navigate("/services")}
        className="mt-3 w-full text-center text-sm font-semibold text-accent touch-target"
      >
        View All Services →
      </button>
    </section>
  );
}
