export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      discovery_conversation_log: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          role: string;
          round_number: number | null;
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          role: string;
          round_number?: number | null;
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          role?: string;
          round_number?: number | null;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_conversation_log_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "discovery_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_questions: {
        Row: {
          answer: string | null;
          answered_at: string | null;
          category: string;
          context: string | null;
          created_at: string;
          id: string;
          priority: number;
          question_text: string;
          round_number: number;
          session_id: string;
        };
        Insert: {
          answer?: string | null;
          answered_at?: string | null;
          category: string;
          context?: string | null;
          created_at?: string;
          id?: string;
          priority: number;
          question_text: string;
          round_number: number;
          session_id: string;
        };
        Update: {
          answer?: string | null;
          answered_at?: string | null;
          category?: string;
          context?: string | null;
          created_at?: string;
          id?: string;
          priority?: number;
          question_text?: string;
          round_number?: number;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discovery_questions_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "discovery_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      discovery_sessions: {
        Row: {
          completed_at: string | null;
          completeness_score: number | null;
          created_at: string;
          current_reasoning: string | null;
          current_round: number;
          final_analysis: Json | null;
          id: string;
          initial_description: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          completeness_score?: number | null;
          created_at?: string;
          current_reasoning?: string | null;
          current_round?: number;
          final_analysis?: Json | null;
          id?: string;
          initial_description: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          completeness_score?: number | null;
          created_at?: string;
          current_reasoning?: string | null;
          current_round?: number;
          final_analysis?: Json | null;
          id?: string;
          initial_description?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      platforms: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      quotation_platforms: {
        Row: {
          platform_id: string;
          quotation_id: string;
        };
        Insert: {
          platform_id: string;
          quotation_id: string;
        };
        Update: {
          platform_id?: string;
          quotation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotation_platforms_platform_id_fkey";
            columns: ["platform_id"];
            isOneToOne: false;
            referencedRelation: "platforms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotation_platforms_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      quotation_tasks: {
        Row: {
          created_at: string;
          id: string;
          man_days: number;
          quotation_id: string;
          task_description: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          man_days: number;
          quotation_id: string;
          task_description: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          man_days?: number;
          quotation_id?: string;
          task_description?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotation_tasks_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      quotations: {
        Row: {
          buffer: number;
          created_at: string;
          discovery_session_id: string | null;
          dynamic_attributes: Json | null;
          estimation_type: string;
          id: string;
          man_days: number;
          scope: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          buffer: number;
          created_at?: string;
          discovery_session_id?: string | null;
          dynamic_attributes?: Json | null;
          estimation_type: string;
          id?: string;
          man_days: number;
          scope: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          buffer?: number;
          created_at?: string;
          discovery_session_id?: string | null;
          dynamic_attributes?: Json | null;
          estimation_type?: string;
          id?: string;
          man_days?: number;
          scope?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotations_discovery_session_id_fkey";
            columns: ["discovery_session_id"];
            isOneToOne: false;
            referencedRelation: "discovery_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          quotation_id: string;
          rating: number;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          quotation_id: string;
          rating: number;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          quotation_id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string;
          errors: string | null;
          id: string;
          session_id: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          errors?: string | null;
          id?: string;
          session_id: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          errors?: string | null;
          id?: string;
          session_id?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_quotation_with_relations: {
        Args: {
          p_user_id: string;
          p_estimation_type: string;
          p_scope: string;
          p_man_days: number;
          p_buffer: number;
          p_dynamic_attributes: Json;
          p_platforms: string[];
          p_tasks: Json[];
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
