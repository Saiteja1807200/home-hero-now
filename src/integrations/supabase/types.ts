export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          label: string
          lat: number | null
          lng: number | null
          pincode: string
          state: string
          street: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          pincode: string
          state: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          pincode?: string
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address_id: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          provider_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          provider_id: string
          scheduled_date: string
          scheduled_time: string
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          provider_id?: string
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      provider_services: {
        Row: {
          base_price: number
          category_id: string
          id: string
          provider_id: string
        }
        Insert: {
          base_price?: number
          category_id: string
          id?: string
          provider_id: string
        }
        Update: {
          base_price?: number
          category_id?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          cleanliness: number
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          professionalism: number
          provider_id: string
          punctuality: number
          quality: number
        }
        Insert: {
          booking_id: string
          cleanliness: number
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          professionalism: number
          provider_id: string
          punctuality: number
          quality: number
        }
        Update: {
          booking_id?: string
          cleanliness?: number
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          professionalism?: number
          provider_id?: string
          punctuality?: number
          quality?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon_name: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon_name: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          bio: string | null
          city: string
          commission_rate: number
          coverage_area: string
          coverage_area_km: number
          created_at: string
          experience_years: number
          id: string
          is_online: boolean
          status: Database["public"]["Enums"]["provider_status"]
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          city?: string
          commission_rate?: number
          coverage_area?: string
          coverage_area_km?: number
          created_at?: string
          experience_years?: number
          id?: string
          is_online?: boolean
          status?: Database["public"]["Enums"]["provider_status"]
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          city?: string
          commission_rate?: number
          coverage_area?: string
          coverage_area_km?: number
          created_at?: string
          experience_years?: number
          id?: string
          is_online?: boolean
          status?: Database["public"]["Enums"]["provider_status"]
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_providers: {
        Row: {
          bio: string | null
          city: string | null
          coverage_area: string | null
          coverage_area_km: number | null
          created_at: string | null
          experience_years: number | null
          id: string | null
          is_online: boolean | null
          status: Database["public"]["Enums"]["provider_status"] | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          coverage_area?: string | null
          coverage_area_km?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          is_online?: boolean | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          coverage_area?: string | null
          coverage_area_km?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          is_online?: boolean | null
          status?: Database["public"]["Enums"]["provider_status"] | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_reviews: {
        Row: {
          booking_id: string | null
          cleanliness: number | null
          comment: string | null
          created_at: string | null
          id: string | null
          professionalism: number | null
          provider_id: string | null
          punctuality: number | null
          quality: number | null
        }
        Insert: {
          booking_id?: string | null
          cleanliness?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          professionalism?: number | null
          provider_id?: string | null
          punctuality?: number | null
          quality?: number | null
        }
        Update: {
          booking_id?: string | null
          cleanliness?: number | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          professionalism?: number | null
          provider_id?: string | null
          punctuality?: number | null
          quality?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "public_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_provider_profile: {
        Args: { provider_user_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      get_provider_profiles: {
        Args: { provider_user_ids: string[] }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "requested"
        | "accepted"
        | "on_the_way"
        | "in_progress"
        | "completed"
        | "cancelled"
      provider_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "requested",
        "accepted",
        "on_the_way",
        "in_progress",
        "completed",
        "cancelled",
      ],
      provider_status: ["pending", "approved", "rejected"],
    },
  },
} as const
