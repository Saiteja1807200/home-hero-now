import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Briefcase, Check, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useToast } from "@/hooks/use-toast";
import { MANCHERIAL_LOCATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  experience_years: z.coerce.number().min(0).max(50),
  coverage_area_km: z.coerce.number().min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface SelectedService {
  categoryId: string;
  price: number;
}

export default function BecomeProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: categories, isLoading: catLoading } = useServiceCategories();

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [coverageArea, setCoverageArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bio: "", experience_years: 0, coverage_area_km: 10 },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.categoryId === categoryId)
        ? prev.filter((s) => s.categoryId !== categoryId)
        : [...prev, { categoryId, price: 500 }]
    );
  };

  const updatePrice = (categoryId: string, price: number) => {
    setSelectedServices((prev) =>
      prev.map((s) => (s.categoryId === categoryId ? { ...s, price } : s))
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    if (selectedServices.length === 0) {
      toast({ title: "Select at least one service category", variant: "destructive" });
      return;
    }
    if (!coverageArea) {
      toast({ title: "Select your service area", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create provider profile
      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .insert({
          user_id: user.id,
          bio: values.bio,
          experience_years: values.experience_years,
          coverage_area_km: values.coverage_area_km,
        })
        .select("id")
        .single();

      if (providerError) throw providerError;

      // Insert provider services
      const serviceRows = selectedServices.map((s) => ({
        provider_id: provider.id,
        category_id: s.categoryId,
        base_price: s.price,
      }));

      const { error: servicesError } = await supabase
        .from("provider_services")
        .insert(serviceRows);

      if (servicesError) throw servicesError;

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

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">Application Submitted!</h1>
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4 pt-6">
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

          {/* Experience & Coverage */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="experience_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverage_area_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage (km)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Services You Offer</p>
            {catLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories?.map((cat) => {
                  const selected = selectedServices.find((s) => s.categoryId === cat.id);
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id} className="rounded-xl border border-border bg-card p-3">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className="flex w-full items-center gap-3"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: cat.color + "22" }}
                        >
                          <Icon size={18} style={{ color: cat.color }} />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium text-foreground">
                          {cat.name}
                        </span>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {selected && <Check size={14} />}
                        </div>
                      </button>

                      {selected && (
                        <div className="mt-3 flex items-center gap-2 pl-12">
                          <span className="text-xs text-muted-foreground">Base price ₹</span>
                          <Input
                            type="number"
                            min={0}
                            className="h-8 w-24 text-sm"
                            value={selected.price}
                            onChange={(e) => updatePrice(cat.id, Number(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
  );
}
