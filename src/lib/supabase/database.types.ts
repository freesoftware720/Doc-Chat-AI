
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          banner_ad_code: string | null
          chat_limit_free_user: number
          daily_reward_clicks_required: number
          daily_reward_link: string | null
          feature_banner_ads_enabled: boolean
          feature_chat_templates_enabled: boolean
          feature_daily_reward_enabled: boolean
          feature_in_feed_ads_enabled: boolean
          feature_multi_pdf_enabled: boolean
          feature_multiplex_ads_enabled: boolean
          feature_video_ads_enabled: boolean
          homepage_announcement_message: string | null
          id: number
          in_feed_ad_code: string | null
          landing_page_content: Json | null
          logo_url: string | null
          multiplex_ad_code: string | null
          subscription_review_hours: number
          updated_at: string | null
          upload_limit_mb_free: number
          upload_limit_mb_pro: number
          video_ad_code: string | null
          video_ad_skip_timer: number
        }
        Insert: {
          banner_ad_code?: string | null
          chat_limit_free_user?: number
          daily_reward_clicks_required?: number
          daily_reward_link?: string | null
          feature_banner_ads_enabled?: boolean
          feature_chat_templates_enabled?: boolean
          feature_daily_reward_enabled?: boolean
          feature_in_feed_ads_enabled?: boolean
          feature_multi_pdf_enabled?: boolean
          feature_multiplex_ads_enabled?: boolean
          feature_video_ads_enabled?: boolean
          homepage_announcement_message?: string | null
          id: number
          in_feed_ad_code?: string | null
          landing_page_content?: Json | null
          logo_url?: string | null
          multiplex_ad_code?: string | null
          subscription_review_hours?: number
          updated_at?: string | null
          upload_limit_mb_free?: number
          upload_limit_mb_pro?: number
          video_ad_code?: string | null
          video_ad_skip_timer?: number
        }
        Update: {
          banner_ad_code?: string | null
          chat_limit_free_user?: number
          daily_reward_clicks_required?: number
          daily_reward_link?: string | null
          feature_banner_ads_enabled?: boolean
          feature_chat_templates_enabled?: boolean
          feature_daily_reward_enabled?: boolean
          feature_in_feed_ads_enabled?: boolean
          feature_multi_pdf_enabled?: boolean
          feature_multiplex_ads_enabled?: boolean
          feature_video_ads_enabled?: boolean
          homepage_announcement_message?: string | null
          id?: number
          in_feed_ad_code?: string | null
          landing_page_content?: Json | null
          logo_url?: string | null
          multiplex_ad_code?: string | null
          subscription_review_hours?: number
          updated_at?: string | null
          upload_limit_mb_free?: number
          upload_limit_mb_pro?: number
          video_ad_code?: string | null
          video_ad_skip_timer?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          file_size: number | null
          id: string
          name: string
          storage_path: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          name: string
          storage_path: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          name?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          created_at: string
          icon_url: string | null
          id: number
          instructions: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id?: number
          instructions: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: number
          instructions?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          currency_symbol: string
          description: string | null
          features: string[]
          id: number
          is_active: boolean
          is_popular: boolean
          name: string
          period: string | null
          price: number
          type: "individual" | "team"
        }
        Insert: {
          created_at?: string
          currency?: string
          currency_symbol?: string
          description?: string | null
          features?: string[]
          id?: number
          is_active?: boolean
          is_popular?: boolean
          name: string
          period?: string | null
          price: number
          type?: "individual" | "team"
        }
        Update: {
          created_at?: string
          currency?: string
          currency_symbol?: string
          description?: string | null
          features?: string[]
          id?: number
          is_active?: boolean
          is_popular?: boolean
          name?: string
          period?: string | null
          price?: number
          type?: "individual" | "team"
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          chat_credits_last_reset: string | null
          chat_credits_used: number
          full_name: string | null
          id: string
          last_daily_reward_claimed_at: string | null
          pro_credits: number | null
          referral_code: string | null
          referred_by: string | null
          status: string | null
          subscription_plan: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          chat_credits_last_reset?: string | null
          chat_credits_used?: number
          full_name?: string | null
          id: string
          last_daily_reward_claimed_at?: string | null
          pro_credits?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string | null
          subscription_plan?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          chat_credits_last_reset?: string | null
          chat_credits_used?: number
          full_name?: string | null
          id?: string
          last_daily_reward_claimed_at?: string | null
          pro_credits?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string | null
          subscription_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_subscription_plan_fkey"
            columns: ["subscription_plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["name"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: number
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          created_at: string
          id: number
          payment_gateway_id: number
          plan_id: number
          receipt_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          payment_gateway_id: number
          plan_id: number
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          payment_gateway_id?: number
          plan_id?: number
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_payment_gateway_id_fkey"
            columns: ["payment_gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string | null
          sender_role: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_role?: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_chat_history: {
        Args: Record<PropertyKey, never>
        Returns: {
          document_id: string
          document_name: string
          last_message_at: string
        }[]
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_ticket_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
