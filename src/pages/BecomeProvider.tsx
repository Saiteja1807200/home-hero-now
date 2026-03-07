import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Briefcase, Check, Loader2, MapPin, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useToast } from "@/hooks/use-toast";
import { MANCHERIAL_LOCATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarUpload from "@/components/profile/AvatarUpload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  experience_years: z.coerce.number().min(1, "Must have at least 1 year of experience").max(50),
  category_id: z.string().min(1, "Select a service category"),
  coverage_area: z.string().min(1, "Select your coverage area"),
  base_price: z.coerce.number().min(1, "Base price must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BecomeProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: catLoading } = useServiceCategories();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyProvider, setAlreadyProvider] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      bio: "",
      experience_years: 1,
      category_id: "",
      coverage_area: "",
      base_price: 500,
    },
  });

  // Check duplicate & auto-fill profile
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      setChecking(true);

      // Duplicate check
      const { data: existing } = await supabase
        .from("service_providers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setAlreadyProvider(true);
        setChecking(false);
        return;
      }

      // Auto-fill from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        form.setValue("full_name", profile.full_name || "");
        form.setValue("phone", profile.phone || "");
        setAvatarUrl(profile.avatar_url);
      }

      setChecking(false);
    };

    init();
  }, [user, form]);

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    if (user) {
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Update profile name/phone
      await supabase
        .from("profiles")
        .update({ full_name: values.full_name, phone: values.phone })
        .eq("id", user.id);

      // Create provider profile
      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .insert({
          user_id: user.id,
          bio: values.bio,
          experience_years: values.experience_years,
          coverage_area: values.coverage_area,
          city: "Mancherial",
          is_online: true,
        } as any)
        .select("id")
        .single();

      if (providerError) throw providerError;

      // Insert provider service
      const { error: servicesError } = await supabase
        .from("provider_services")
        .insert({
          provider_id: provider.id,
          category_id: values.category_id,
          base_price: values.base_price,
        });

      if (servicesError) throw servicesError;

      queryClient.invalidateQueries({ queryKey: ["my-provider-status"] });
      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already registered
  if (alreadyProvider) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">Already Registered</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          You are already registered as a provider.
        </p>
        <Button className="mt-4" onClick={() => navigate("/profile")}>
          Back to Profile
        </Button>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">You are now registered as a service provider.</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your provider profile is pending review. We'll notify you once it's approved.
        </p>
        <Button className="mt-4" onClick={() => navigate("/profile")}>
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 py-3">
        <button onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">Become a Provider</h1>
      </div>

      <div className="px-4 pt-6">
        {/* Avatar Upload */}
        {user && (
          <div className="mb-6">
            <AvatarUpload userId={user.id} currentUrl={avatarUrl} onUploaded={handleAvatarUploaded} />
            <p className="text-center text-xs text-muted-foreground mt-2">Tap to upload photo</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Service Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Service Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {catLoading ? (
                        <SelectItem value="_loading" disabled>Loading…</SelectItem>
                      ) : (
                        categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience & Base Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (years)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={50} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Coverage Area */}
            <FormField
              control={form.control}
              name="coverage_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Area</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MANCHERIAL_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          <span className="flex items-center gap-2">
                            <MapPin size={12} className="flex-shrink-0" />
                            {loc}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell customers about your experience and skills…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full touch-target" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Briefcase size={16} /> Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
