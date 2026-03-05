import {
  Zap, Droplets, Wind, WashingMachine, Refrigerator, Tv,
  Bug, Sparkles, Hammer, GlassWater, Filter, Flame, CookingPot, Paintbrush,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "electrician", name: "Electrician", icon: Zap, colorClass: "text-category-electrical", bgClass: "bg-category-electrical/15" },
  { id: "plumber", name: "Plumber", icon: Droplets, colorClass: "text-category-plumbing", bgClass: "bg-category-plumbing/15" },
  { id: "ac-repair", name: "AC Repair", icon: Wind, colorClass: "text-category-ac", bgClass: "bg-category-ac/15" },
  { id: "washing-machine", name: "Washing Machine", icon: WashingMachine, colorClass: "text-category-appliance", bgClass: "bg-category-appliance/15" },
  { id: "refrigerator", name: "Refrigerator", icon: Refrigerator, colorClass: "text-category-ac", bgClass: "bg-category-ac/15" },
  { id: "television", name: "TV Repair", icon: Tv, colorClass: "text-category-appliance", bgClass: "bg-category-appliance/15" },
  { id: "pest-control", name: "Pest Control", icon: Bug, colorClass: "text-category-pest", bgClass: "bg-category-pest/15" },
  { id: "cleaning", name: "Home Cleaning", icon: Sparkles, colorClass: "text-category-cleaning", bgClass: "bg-category-cleaning/15" },
  { id: "carpenter", name: "Carpenter", icon: Hammer, colorClass: "text-category-carpentry", bgClass: "bg-category-carpentry/15" },
  { id: "water-purifier", name: "Water Purifier", icon: GlassWater, colorClass: "text-category-plumbing", bgClass: "bg-category-plumbing/15" },
  { id: "ro-filter", name: "RO Filter", icon: Filter, colorClass: "text-category-plumbing", bgClass: "bg-category-plumbing/15" },
  { id: "geyser", name: "Geyser Repair", icon: Flame, colorClass: "text-category-pest", bgClass: "bg-category-pest/15" },
  { id: "gas-stove", name: "Gas Stove", icon: CookingPot, colorClass: "text-category-carpentry", bgClass: "bg-category-carpentry/15" },
  { id: "painting", name: "Painting", icon: Paintbrush, colorClass: "text-category-painting", bgClass: "bg-category-painting/15" },
];

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
