import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProviderCardProps {
  name: string;
  service: string;
  rating: number;
  jobs: number;
  distance: string;
  eta: string;
  image?: string;
  verified?: boolean;
}

export default function ProviderCard({
  name, service, rating, jobs, distance, eta, image, verified,
}: ProviderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-w-[260px] snap-start rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
              {name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-sm text-foreground truncate">{name}</h3>
            {verified && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">✓</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{service}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star size={12} className="fill-warning text-warning" />
              <span className="font-medium text-foreground">{rating}</span>
              <span>({jobs})</span>
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin size={12} />
              {distance}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock size={12} />
              {eta}
            </span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold touch-target"
      >
        Book Now
      </Button>
    </motion.div>
  );
}
