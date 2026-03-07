import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { toast } from "@/hooks/use-toast";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setAvatarUrl(data.avatar_url);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      navigate("/profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate("/profile")} className="touch-target">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-bold">Edit Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        <AvatarUpload userId={user!.id} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />

        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">Email is linked to your account and cannot be changed here.</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full touch-target">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
