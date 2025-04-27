export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      quotations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          content: string;
          author: string | null;
          source: string | null;
          user_id: string;
          tags: string[] | null;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          content: string;
          author?: string | null;
          source?: string | null;
          user_id: string;
          tags?: string[] | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          content?: string;
          author?: string | null;
          source?: string | null;
          user_id?: string;
          tags?: string[] | null;
          is_public?: boolean;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}
