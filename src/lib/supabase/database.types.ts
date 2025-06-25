
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: number
          user_email: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: number
          user_email?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: number
          user_email?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          name: string
          storage_path: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          name: string
          storage_path: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
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
      profiles: {
        Row: {
          active_workspace_id: string | null
          avatar_url: string | null
          full_name: string | null
          id: string
          subscription_plan: string | null
          status: string | null
        }
        Insert: {
          active_workspace_id?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id: string
          subscription_plan?: string | null
          status?: string | null
        }
        Update: {
          active_workspace_id?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          subscription_plan?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_workspace_id_fkey"
            columns: ["active_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          role: "admin" | "member"
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role?: "admin" | "member"
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: "admin" | "member"
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          allowed_file_types: string[] | null
          brand_color: string | null
          created_at: string
          id: string
          logo_url: string | null
          max_documents: number
          name: string
          owner_id: string
        }
        Insert: {
          allowed_file_types?: string[] | null
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_documents?: number
          name: string
          owner_id: string
        }
        Update: {
          allowed_file_types?: string[] | null
          brand_color?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          max_documents?: number
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
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
      create_personal_workspace: {
        Args: Record<PropertyKey, never>
        Returns: unknown
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
        Returns: {
          id: string
          aud: string
          role: string
          email: string
          phone: string
          created_at: string
          last_sign_in_at: string
          app_metadata: Json
          user_metadata: Json
          identities: Json
          updated_at: string
          is_anonymous: boolean
        }
      }
    }
    Enums: {
      workspace_role: "admin" | "member"
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
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
