import { User, MapPin, Settings, LogOut, ChevronRight, Star, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold">
            G
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Guest User</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your account</p>
          </div>
        </div>
        <Button className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold touch-target">
          Sign In / Register
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 px-4 py-3">
        {[
          { icon: CalendarDays, label: "Bookings", value: "0" },
          { icon: Star, label: "Reviews", value: "0" },
          { icon: MapPin, label: "Addresses", value: "0" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex-1 rounded-xl border border-border bg-card p-3 text-center">
            <Icon size={18} className="mx-auto mb-1 text-muted-foreground" />
            <p className="font-display text-lg font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="mt-2 px-4">
        {[
          { icon: User, label: "Edit Profile" },
          { icon: MapPin, label: "Saved Addresses" },
          { icon: Settings, label: "Settings" },
          { icon: LogOut, label: "Sign Out" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 py-3.5 border-b border-border touch-target"
          >
            <Icon size={18} className="text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">{label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
