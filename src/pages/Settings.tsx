import { useState } from "react";
import { ArrowLeft, Sun, Moon, Monitor, Bell, BellOff, Key, LogOut, Trash2, CalendarDays, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

function useNotifPrefs() {
  const key = "notif_prefs";
  const defaults = { bookingUpdates: true, providerArrival: true, promotions: false };
  const stored = localStorage.getItem(key);
  const prefs = stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  const set = (p: typeof defaults) => { localStorage.setItem(key, JSON.stringify(p)); };
  return { prefs, set };
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { prefs: notifPrefs, set: setNotifPrefs } = useNotifPrefs();
  const [notifs, setNotifs] = useState(notifPrefs);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleNotif = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    setNotifPrefs(updated);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Password reset email sent", description: "Check your inbox." });
  };

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw res.error;
      await supabase.auth.signOut();
      navigate("/auth");
      toast({ title: "Account deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleting(false);
    setDeleteOpen(false);
  };

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate("/profile")} className="touch-target">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Appearance */}
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Appearance</h2>
          <div className="flex gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                  theme === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Booking Management */}
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Booking Management</h2>
          <button
            onClick={() => navigate("/bookings")}
            className="flex w-full items-center gap-3 py-3 border-b border-border touch-target"
          >
            <CalendarDays size={18} className="text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-medium text-foreground">View Booking History</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Notifications</h2>
          <div className="space-y-4">
            {([
              { key: "bookingUpdates" as const, label: "Booking Updates", desc: "Status changes for your bookings" },
              { key: "providerArrival" as const, label: "Provider Arrival", desc: "When provider is on the way" },
              { key: "promotions" as const, label: "Promotions", desc: "Deals and special offers" },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={notifs[key]} onCheckedChange={() => toggleNotif(key)} />
              </div>
            ))}
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Account</h2>
          <div className="space-y-1">
            <button onClick={handleChangePassword} className="flex w-full items-center gap-3 py-3 border-b border-border touch-target">
              <Key size={18} className="text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">Change Password</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button onClick={handleSignOutAll} className="flex w-full items-center gap-3 py-3 border-b border-border touch-target">
              <LogOut size={18} className="text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">Log Out from All Devices</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button onClick={() => setDeleteOpen(true)} className="flex w-full items-center gap-3 py-3 touch-target">
              <Trash2 size={18} className="text-destructive" />
              <span className="flex-1 text-left text-sm font-medium text-destructive">Delete Account</span>
              <ChevronRight size={16} className="text-destructive" />
            </button>
          </div>
        </section>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your profile and saved data. Your booking history will be archived. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
