import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { toast } from "@/hooks/use-toast";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { MANCHERIAL_LOCATIONS } from "@/lib/constants";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useServiceCategories();

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Provider fields
  const [isProvider, setIsProvider] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerServiceId, setProviderServiceId] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("1");
  const [coverageArea, setCoverageArea] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAvatarUrl(profile.avatar_url);
      }

      // Check if provider
      const { data: provider } = await supabase
        .from("service_providers")
        .select("id, bio, experience_years, coverage_area, is_online")
        .eq("user_id", user.id)
        .maybeSingle();

      if (provider) {
        setIsProvider(true);
        setProviderId(provider.id);
        setBio(provider.bio || "");
        setExperienceYears(String(provider.experience_years || 1));
        setCoverageArea(provider.coverage_area || "");
        setIsOnline(provider.is_online);

        // Load provider service
        const { data: svc } = await supabase
          .from("provider_services")
          .select("id, base_price, category_id")
          .eq("provider_id", provider.id)
          .limit(1)
          .maybeSingle();

        if (svc) {
          setProviderServiceId(svc.id);
          setBasePrice(String(svc.base_price));
          setCategoryId(svc.category_id);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = "Name is required";

    if (isProvider) {
      if (!categoryId) errs.categoryId = "Select a service category";
      const exp = parseInt(experienceYears);
      if (isNaN(exp) || exp < 1) errs.experienceYears = "Experience must be at least 1 year";
      const price = parseFloat(basePrice);
      if (isNaN(price) || price <= 0) errs.basePrice = "Enter a valid price";
      if (!coverageArea) errs.coverageArea = "Select a coverage area";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setSaving(true);

    try {
      // Update profile
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim(), avatar_url: avatarUrl })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      // Update provider if applicable
      if (isProvider && providerId) {
        const { error: provErr } = await supabase
          .from("service_providers")
          .update({
            bio: bio.trim(),
            experience_years: parseInt(experienceYears),
            coverage_area: coverageArea,
            is_online: isOnline,
          })
          .eq("id", providerId);

        if (provErr) throw provErr;

        // Update provider service
        if (providerServiceId) {
          const { error: svcErr } = await supabase
            .from("provider_services")
            .update({
              base_price: parseFloat(basePrice),
              category_id: categoryId,
            })
            .eq("id", providerServiceId);

          if (svcErr) throw svcErr;
        }
      }

      toast({ title: "Profile updated successfully." });
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["my-provider-status"] });
      navigate("/profile");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate("/profile")} className="touch-target">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-bold">Edit Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <AvatarUpload userId={user!.id} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
        </div>

        {/* Provider Section */}
        {isProvider && (
          <>
            <Separator />
            <h2 className="font-display text-base font-bold text-foreground">Provider Details</h2>

            {/* Service Category */}
            <div className="space-y-1.5">
              <Label>Service Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                min="1"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
              {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears}</p>}
            </div>

            {/* Coverage Area */}
            <div className="space-y-1.5">
              <Label>Coverage Area</Label>
              <Select value={coverageArea} onValueChange={setCoverageArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {MANCHERIAL_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.coverageArea && <p className="text-xs text-destructive">{errors.coverageArea}</p>}
            </div>

            {/* Base Price */}
            <div className="space-y-1.5">
              <Label>Base Service Price (₹)</Label>
              <Input
                type="number"
                min="1"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 299"
              />
              {errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice}</p>}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label>Short Bio / Service Description</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your expertise..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/500</p>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Availability Status</Label>
                <p className="text-xs text-muted-foreground">{isOnline ? "Online — visible to customers" : "Offline — hidden from search"}</p>
              </div>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full touch-target">
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
