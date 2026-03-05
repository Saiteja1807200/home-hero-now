import {
  Zap, Droplets, Wind, WashingMachine, Refrigerator, Tv,
  Bug, Sparkles, Hammer, GlassWater, Filter, Flame, CookingPot, Paintbrush,
  type LucideIcon,
} from "lucide-react";

/** Maps icon_name from DB → Lucide component */
export const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Droplets,
  Wind,
  WashingMachine,
  Refrigerator,
  Tv,
  Bug,
  Sparkles,
  Hammer,
  GlassWater,
  Filter,
  Flame,
  CookingPot,
  Paintbrush,
};

export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "on_the_way",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  on_the_way: "On the Way",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "bg-warning/15 text-warning",
  accepted: "bg-info/15 text-info",
  on_the_way: "bg-accent/15 text-accent",
  in_progress: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};
