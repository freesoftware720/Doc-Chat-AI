
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
          chat_limit_free_user: number
          feature_chat_templates_enabled: boolean
          feature_multi_pdf_enabled: boolean
          homepage_announcement_message: string | null
          id: number
          landing_page_content: Json | null
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          chat_limit_free_user?: number
          feature_chat_templates_enabled?: boolean
          feature_multi_pdf_enabled?: boolean
          homepage_announcement_message?: string | null
          id: number
          landing_page_content?: Json | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          chat_limit_free_user?: number
          feature_chat_templates_enabled?: boolean
          feature_multi_pdf_enabled?: boolean
          homepage_announcement_message?: string | null
          id?: number
          landing_page_content?: Json | null
          logo_url?: string | null
          updated_at?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          chat_credits_last_reset: string | null
          chat_credits_used: number
          full_name: string | null
          id: string
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

    
