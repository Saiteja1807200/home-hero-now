import { MapPin, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MANCHERIAL_LOCATIONS } from "@/lib/constants";
import { useState } from "react";

interface LocationBarProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export default function LocationBar({ selectedLocation, onLocationChange }: LocationBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-4 py-3 safe-top touch-target">
          <MapPin size={18} className="text-accent" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
              {selectedLocation}
            </span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {MANCHERIAL_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  onLocationChange(loc);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/10 transition-colors"
              >
                <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-left">{loc}</span>
                {selectedLocation === loc && (
                  <Check size={14} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
