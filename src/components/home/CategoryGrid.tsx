import { SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 font-display text-lg font-bold text-foreground">Services</h2>
      <div className="grid grid-cols-4 gap-3">
        {SERVICE_CATEGORIES.slice(0, 8).map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onClick={() => navigate(`/services/${cat.id}`)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", cat.bgClass)}>
              <cat.icon size={24} className={cat.colorClass} />
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
