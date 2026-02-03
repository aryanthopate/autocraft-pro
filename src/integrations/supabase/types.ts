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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cars: {
        Row: {
          color: string | null
          condition_notes: string | null
          created_at: string
          customer_id: string
          existing_modifications: string | null
          id: string
          license_plate: string | null
          make: string
          mileage: number | null
          model: string
          notes: string | null
          registration_number: string | null
          studio_id: string
          updated_at: string
          vehicle_type: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          condition_notes?: string | null
          created_at?: string
          customer_id: string
          existing_modifications?: string | null
          id?: string
          license_plate?: string | null
          make: string
          mileage?: number | null
          model: string
          notes?: string | null
          registration_number?: string | null
          studio_id: string
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          condition_notes?: string | null
          created_at?: string
          customer_id?: string
          existing_modifications?: string | null
          id?: string
          license_plate?: string | null
          make?: string
          mileage?: number | null
          model?: string
          notes?: string | null
          registration_number?: string | null
          studio_id?: string
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          gstn: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          studio_id: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          gstn?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          studio_id: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          gstn?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          studio_id?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          job_id: string
          notes: string | null
          status: string
          studio_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          job_id: string
          notes?: string | null
          status?: string
          studio_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          job_id?: string
          notes?: string | null
          status?: string
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      job_condition_media: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          media_type: string
          notes: string | null
          stage: string
          uploaded_by: string | null
          url: string
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          media_type: string
          notes?: string | null
          stage: string
          uploaded_by?: string | null
          url: string
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          media_type?: string
          notes?: string | null
          stage?: string
          uploaded_by?: string | null
          url?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_condition_media_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_condition_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_media: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          stage: string
          type: string
          uploaded_by: string | null
          url: string
          zone_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          stage: string
          type: string
          uploaded_by?: string | null
          url: string
          zone_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          stage?: string
          type?: string
          uploaded_by?: string | null
          url?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_media_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_media_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "job_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      job_submissions: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          issues_found: string | null
          job_id: string
          notes: string | null
          submitted_by: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          issues_found?: string | null
          job_id: string
          notes?: string | null
          submitted_by: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          issues_found?: string | null
          job_id?: string
          notes?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_zones: {
        Row: {
          color_change: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          expected_result: string | null
          id: string
          job_id: string
          labor_time_minutes: number | null
          notes: string | null
          price: number | null
          services: Json | null
          updated_at: string
          zone_name: string
          zone_type: string
        }
        Insert: {
          color_change?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          expected_result?: string | null
          id?: string
          job_id: string
          labor_time_minutes?: number | null
          notes?: string | null
          price?: number | null
          services?: Json | null
          updated_at?: string
          zone_name: string
          zone_type: string
        }
        Update: {
          color_change?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          expected_result?: string | null
          id?: string
          job_id?: string
          labor_time_minutes?: number | null
          notes?: string | null
          price?: number | null
          services?: Json | null
          updated_at?: string
          zone_name?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_zones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          car_id: string
          created_at: string
          customer_id: string
          customer_view_token: string | null
          estimated_completion: string | null
          id: string
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["job_status"]
          studio_id: string
          total_price: number | null
          transport: Database["public"]["Enums"]["transport_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          car_id: string
          created_at?: string
          customer_id: string
          customer_view_token?: string | null
          estimated_completion?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          studio_id: string
          total_price?: number | null
          transport?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          car_id?: string
          created_at?: string
          customer_id?: string
          customer_view_token?: string | null
          estimated_completion?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          studio_id?: string
          total_price?: number | null
          transport?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["staff_status"]
          studio_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["staff_status"]
          studio_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["staff_status"]
          studio_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          join_key: string
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
          whatsapp_api_key: string | null
          whatsapp_phone_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          join_key: string
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_phone_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          join_key?: string
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_phone_number?: string | null
        }
        Relationships: []
      }
      transport_records: {
        Row: {
          condition_notes: string | null
          created_at: string
          existing_damage: string | null
          id: string
          job_id: string
          recorded_at: string
          recorded_by: string | null
          type: string
        }
        Insert: {
          condition_notes?: string | null
          created_at?: string
          existing_damage?: string | null
          id?: string
          job_id: string
          recorded_at?: string
          recorded_by?: string | null
          type: string
        }
        Update: {
          condition_notes?: string | null
          created_at?: string
          existing_damage?: string | null
          id?: string
          job_id?: string
          recorded_at?: string
          recorded_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_records_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          job_id: string
          notes: string | null
          performed_by: string
          zone_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          performed_by: string
          zone_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          performed_by?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "job_zones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_join_key: { Args: never; Returns: string }
      get_user_studio_id: { Args: { p_user_id: string }; Returns: string }
      is_studio_owner: {
        Args: { p_studio_id: string; p_user_id: string }
        Returns: boolean
      }
      user_belongs_to_studio: {
        Args: { p_studio_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      job_status:
        | "pending"
        | "scheduled"
        | "in_progress"
        | "awaiting_review"
        | "completed"
        | "cancelled"
      staff_status: "pending" | "approved" | "rejected"
      transport_type: "pickup" | "drop" | "both" | "none"
      user_role: "owner" | "staff"
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
      job_status: [
        "pending",
        "scheduled",
        "in_progress",
        "awaiting_review",
        "completed",
        "cancelled",
      ],
      staff_status: ["pending", "approved", "rejected"],
      transport_type: ["pickup", "drop", "both", "none"],
      user_role: ["owner", "staff"],
    },
  },
} as const
