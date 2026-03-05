import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ICON_MAP } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

export interface ServiceCategoryDB {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  description: string | null;
  is_active: boolean;
}

export interface ServiceCategoryResolved {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string; // hex color from DB
  description: string | null;
}

async function fetchCategories(): Promise<ServiceCategoryResolved[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, name, icon_name, color, description, is_active")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data as ServiceCategoryDB[]).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: ICON_MAP[cat.icon_name] ?? ICON_MAP["Zap"],
    color: cat.color,
    description: cat.description,
  }));
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
