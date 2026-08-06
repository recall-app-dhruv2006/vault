/**
 * Hand-authored mirror of the Supabase schema (supabase/migrations/*.sql).
 *
 * Once you have a live Supabase project, regenerate this file for drift-free
 * accuracy with:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 * (then re-apply the JSDoc header and any manual additions below the marker).
 */

export type ItemType = "link" | "image" | "pdf" | "note" | "receipt";
export type ProcessingStatus = "uploaded" | "queued" | "processing" | "completed" | "failed" | "needs_review";
export type ContentCategory =
  | "image" | "product" | "receipt" | "article" | "recipe" | "travel"
  | "restaurant" | "video" | "document" | "note" | "other";
export type PlanId = "free" | "pro";
export type ReturnStatus = "open" | "returned" | "expired" | "not_applicable";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "none";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          plan: PlanId;
          onboarding_completed: boolean;
          onboarding_step: string;
          save_preferences: string[];
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          summary: string | null;
          item_type: ItemType;
          content_category: ContentCategory;
          source_url: string | null;
          source_domain: string | null;
          original_filename: string | null;
          storage_path: string | null;
          thumbnail_path: string | null;
          mime_type: string | null;
          file_size: number | null;
          raw_text: string | null;
          searchable_text: string | null;
          ai_analysis: Record<string, unknown> | null;
          user_corrections: Record<string, unknown>;
          processing_status: ProcessingStatus;
          processing_error: string | null;
          processing_attempts: number;
          is_favorite: boolean;
          is_archived: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          last_viewed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["items"]["Row"]> & { user_id: string; item_type: ItemType };
        Update: Partial<Database["public"]["Tables"]["items"]["Row"]>;
        Relationships: [];
      };
      item_embeddings: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          content: string;
          embedding: number[] | null;
          chunk_index: number;
          page_number: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["item_embeddings"]["Row"]> & {
          item_id: string; user_id: string; content: string;
        };
        Update: Partial<Database["public"]["Tables"]["item_embeddings"]["Row"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; user_id: string; name: string; normalized_name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & { user_id: string; name: string; normalized_name: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Relationships: [];
      };
      item_tags: {
        Row: { item_id: string; tag_id: string };
        Insert: { item_id: string; tag_id: string };
        Update: Partial<{ item_id: string; tag_id: string }>;
        Relationships: [
          { foreignKeyName: "item_tags_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
          { foreignKeyName: "item_tags_tag_id_fkey"; columns: ["tag_id"]; isOneToOne: false; referencedRelation: "tags"; referencedColumns: ["id"] },
        ];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cover_image_path: string | null;
          icon: string;
          is_smart: boolean;
          smart_filter: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> & { user_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
        Relationships: [];
      };
      collection_items: {
        Row: { collection_id: string; item_id: string; added_at: string };
        Insert: { collection_id: string; item_id: string };
        Update: Partial<{ collection_id: string; item_id: string }>;
        Relationships: [
          { foreignKeyName: "collection_items_collection_id_fkey"; columns: ["collection_id"]; isOneToOne: false; referencedRelation: "collections"; referencedColumns: ["id"] },
          { foreignKeyName: "collection_items_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
        ];
      };
      receipts: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          merchant: string | null;
          purchase_date: string | null;
          subtotal: number | null;
          tax: number | null;
          total: number | null;
          currency: string;
          order_number: string | null;
          payment_method: string | null;
          store_category: string | null;
          return_deadline: string | null;
          return_deadline_source: "extracted" | "manual" | "none";
          return_status: ReturnStatus;
          reminder_enabled: boolean;
          warranty_end: string | null;
          extraction_confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["receipts"]["Row"]> & { item_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["receipts"]["Row"]>;
        Relationships: [
          { foreignKeyName: "receipts_item_id_fkey"; columns: ["item_id"]; isOneToOne: true; referencedRelation: "items"; referencedColumns: ["id"] },
        ];
      };
      receipt_line_items: {
        Row: { id: string; receipt_id: string; name: string; quantity: number; unit_price: number | null; total_price: number | null };
        Insert: Partial<Database["public"]["Tables"]["receipt_line_items"]["Row"]> & { receipt_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["receipt_line_items"]["Row"]>;
        Relationships: [];
      };
      search_history: {
        Row: { id: string; user_id: string; query: string; filters: Record<string, unknown> | null; result_count: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["search_history"]["Row"]> & { user_id: string; query: string };
        Update: Partial<Database["public"]["Tables"]["search_history"]["Row"]>;
        Relationships: [];
      };
      item_views: {
        Row: { id: string; item_id: string; user_id: string; viewed_at: string };
        Insert: Partial<Database["public"]["Tables"]["item_views"]["Row"]> & { item_id: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["item_views"]["Row"]>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: "light" | "dark" | "system";
          default_view: "grid" | "list";
          default_sort: "recent" | "oldest" | "title" | "relevance";
          items_per_page: number;
          auto_summarize: boolean;
          auto_tagging: boolean;
          receipt_extraction: boolean;
          suggested_collections: boolean;
          email_notifications: boolean;
          return_reminders: boolean;
          processing_notifications: boolean;
          product_updates: boolean;
          data_processing_preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_settings"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          plan: PlanId;
          status: SubscriptionStatus;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: { id: string; user_id: string | null; event_name: string; metadata: Record<string, unknown>; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["analytics_events"]["Row"]> & { event_name: string };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_item_embeddings: {
        Args: { query_embedding: number[]; match_user_id: string; match_count?: number; similarity_threshold?: number };
        Returns: { item_id: string; chunk_content: string; page_number: number | null; similarity: number }[];
      };
      search_items_fts: {
        Args: { search_query: string; match_user_id: string; match_count?: number };
        Returns: { item_id: string; rank: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
