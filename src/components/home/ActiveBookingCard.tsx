import { Clock, ArrowRight } from "lucide-react";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type BookingStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActiveBookingCardProps {
  providerName: string;
  service: string;
  status: BookingStatus;
  time: string;
}

export default function ActiveBookingCard({ providerName, service, status, time }: ActiveBookingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-semibold text-foreground">Active Booking</h3>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", BOOKING_STATUS_COLORS[status])}>
          {BOOKING_STATUS_LABELS[status]}
        </span>
      </div>
      <p className="text-sm text-foreground font-medium">{service}</p>
      <p className="text-xs text-muted-foreground">by {providerName}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} /> {time}
        </span>
        <button className="flex items-center gap-1 text-xs font-semibold text-accent">
          Track <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}
