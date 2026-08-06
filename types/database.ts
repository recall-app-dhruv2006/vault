/**
 * Generated from the live Supabase schema on 2026-08-06 via:
 *   Project Settings -> Data API -> Docs -> "Generate and download types"
 * (equivalent to `npx supabase gen types typescript --project-id dqymdmqskdctrqrobpwf`)
 *
 * Do not hand-edit. Regenerate the same way after any migration change.
 */

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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          added_at: string
          collection_id: string
          item_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          item_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_path: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          is_smart: boolean
          name: string
          smart_filter: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_smart?: boolean
          name: string
          smart_filter?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_path?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_smart?: boolean
          name?: string
          smart_filter?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      item_embeddings: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          embedding: string | null
          id: string
          item_id: string
          page_number: number | null
          user_id: string
        }
        Insert: {
          chunk_index?: number
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          item_id: string
          page_number?: number | null
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          item_id?: string
          page_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_embeddings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
        }
        Insert: {
          item_id: string
          tag_id: string
        }
        Update: {
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      item_views: {
        Row: {
          id: string
          item_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_views_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          ai_analysis: Json | null
          content_category: Database["public"]["Enums"]["content_category"]
          created_at: string
          deleted_at: string | null
          file_size: number | null
          fts: unknown
          id: string
          is_archived: boolean
          is_favorite: boolean
          item_type: Database["public"]["Enums"]["item_type"]
          last_viewed_at: string | null
          mime_type: string | null
          original_filename: string | null
          processing_attempts: number
          processing_error: string | null
          processing_status: Database["public"]["Enums"]["processing_status"]
          raw_text: string | null
          searchable_text: string | null
          source_domain: string | null
          source_url: string | null
          storage_path: string | null
          summary: string | null
          thumbnail_path: string | null
          title: string
          updated_at: string
          user_corrections: Json
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          content_category?: Database["public"]["Enums"]["content_category"]
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          fts?: unknown
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          item_type: Database["public"]["Enums"]["item_type"]
          last_viewed_at?: string | null
          mime_type?: string | null
          original_filename?: string | null
          processing_attempts?: number
          processing_error?: string | null
          processing_status?: Database["public"]["Enums"]["processing_status"]
          raw_text?: string | null
          searchable_text?: string | null
          source_domain?: string | null
          source_url?: string | null
          storage_path?: string | null
          summary?: string | null
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          user_corrections?: Json
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          content_category?: Database["public"]["Enums"]["content_category"]
          created_at?: string
          deleted_at?: string | null
          file_size?: number | null
          fts?: unknown
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          item_type?: Database["public"]["Enums"]["item_type"]
          last_viewed_at?: string | null
          mime_type?: string | null
          original_filename?: string | null
          processing_attempts?: number
          processing_error?: string | null
          processing_status?: Database["public"]["Enums"]["processing_status"]
          raw_text?: string | null
          searchable_text?: string | null
          source_domain?: string | null
          source_url?: string | null
          storage_path?: string | null
          summary?: string | null
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          user_corrections?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_demo: boolean
          onboarding_completed: boolean
          onboarding_step: string
          plan: Database["public"]["Enums"]["plan_id"]
          save_preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_demo?: boolean
          onboarding_completed?: boolean
          onboarding_step?: string
          plan?: Database["public"]["Enums"]["plan_id"]
          save_preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_demo?: boolean
          onboarding_completed?: boolean
          onboarding_step?: string
          plan?: Database["public"]["Enums"]["plan_id"]
          save_preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      receipt_line_items: {
        Row: {
          id: string
          name: string
          quantity: number
          receipt_id: string
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          name: string
          quantity?: number
          receipt_id: string
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          receipt_id?: string
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_line_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          currency: string
          extraction_confidence: number | null
          id: string
          item_id: string
          merchant: string | null
          order_number: string | null
          payment_method: string | null
          purchase_date: string | null
          reminder_enabled: boolean
          return_deadline: string | null
          return_deadline_source: string
          return_status: Database["public"]["Enums"]["return_status"]
          store_category: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
          user_id: string
          warranty_end: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          extraction_confidence?: number | null
          id?: string
          item_id: string
          merchant?: string | null
          order_number?: string | null
          payment_method?: string | null
          purchase_date?: string | null
          reminder_enabled?: boolean
          return_deadline?: string | null
          return_deadline_source?: string
          return_status?: Database["public"]["Enums"]["return_status"]
          store_category?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
          warranty_end?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          extraction_confidence?: number | null
          id?: string
          item_id?: string
          merchant?: string | null
          order_number?: string | null
          payment_method?: string | null
          purchase_date?: string | null
          reminder_enabled?: boolean
          return_deadline?: string | null
          return_deadline_source?: string
          return_status?: Database["public"]["Enums"]["return_status"]
          store_category?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string
          warranty_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          result_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          result_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_id"]
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_id"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_id"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_summarize: boolean
          auto_tagging: boolean
          created_at: string
          data_processing_preferences: Json
          default_sort: string
          default_view: string
          email_notifications: boolean
          items_per_page: number
          processing_notifications: boolean
          product_updates: boolean
          receipt_extraction: boolean
          return_reminders: boolean
          suggested_collections: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_summarize?: boolean
          auto_tagging?: boolean
          created_at?: string
          data_processing_preferences?: Json
          default_sort?: string
          default_view?: string
          email_notifications?: boolean
          items_per_page?: number
          processing_notifications?: boolean
          product_updates?: boolean
          receipt_extraction?: boolean
          return_reminders?: boolean
          suggested_collections?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_summarize?: boolean
          auto_tagging?: boolean
          created_at?: string
          data_processing_preferences?: Json
          default_sort?: string
          default_view?: string
          email_notifications?: boolean
          items_per_page?: number
          processing_notifications?: boolean
          product_updates?: boolean
          receipt_extraction?: boolean
          return_reminders?: boolean
          suggested_collections?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_item_embeddings: {
        Args: {
          match_count?: number
          match_user_id: string
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          chunk_content: string
          item_id: string
          page_number: number
          similarity: number
        }[]
      }
      search_items_fts: {
        Args: {
          match_count?: number
          match_user_id: string
          search_query: string
        }
        Returns: {
          item_id: string
          rank: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      content_category:
        | "image"
        | "product"
        | "receipt"
        | "article"
        | "recipe"
        | "travel"
        | "restaurant"
        | "video"
        | "document"
        | "note"
        | "other"
      item_type: "link" | "image" | "pdf" | "note" | "receipt"
      plan_id: "free" | "pro"
      processing_status:
        | "uploaded"
        | "queued"
        | "processing"
        | "completed"
        | "failed"
        | "needs_review"
      return_status: "open" | "returned" | "expired" | "not_applicable"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Manual additions below the CLI-generated marker (per the header note above):
 * convenience aliases used throughout the app so call sites don't have to
 * spell out the full `Database["public"]["Enums"]["..."]` path.
 */
export type ItemType = Database["public"]["Enums"]["item_type"];
export type ProcessingStatus = Database["public"]["Enums"]["processing_status"];

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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_category: [
        "image",
        "product",
        "receipt",
        "article",
        "recipe",
        "travel",
        "restaurant",
        "video",
        "document",
        "note",
        "other",
      ],
      item_type: ["link", "image", "pdf", "note", "receipt"],
      plan_id: ["free", "pro"],
      processing_status: [
        "uploaded",
        "queued",
        "processing",
        "completed",
        "failed",
        "needs_review",
      ],
      return_status: ["open", "returned", "expired", "not_applicable"],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "incomplete",
        "none",
      ],
    },
  },
} as const
