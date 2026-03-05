import { MapPin, ChevronDown } from "lucide-react";

export default function LocationBar() {
  return (
    <button className="flex items-center gap-1.5 px-4 py-3 safe-top touch-target">
      <MapPin size={18} className="text-accent" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-foreground">Current Location</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </div>
    </button>
  );
}
