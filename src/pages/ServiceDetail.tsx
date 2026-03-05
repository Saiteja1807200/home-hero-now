import { SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search, UserCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function ServiceDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);

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
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", category.bgClass)}>
            <category.icon size={18} className={category.colorClass} />
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

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center gap-3 px-6 pt-20 text-center"
      >
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", category.bgClass)}>
          <UserCheck size={28} className={category.colorClass} />
        </div>
        <h2 className="font-display text-base font-bold text-foreground">No providers yet</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
          We're onboarding {category.name.toLowerCase()} providers in your area. Check back soon!
        </p>
      </motion.div>
    </div>
  );
}
