import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          gutenberg_id: number | null;
          source_url: string | null;
          language: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          gutenberg_id?: number | null;
          source_url?: string | null;
          language?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          gutenberg_id?: number | null;
          source_url?: string | null;
          language?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          book_id: string | null;
          number: number;
          title: string | null;
        };
        Insert: {
          id?: string;
          book_id?: string | null;
          number: number;
          title?: string | null;
        };
        Update: {
          id?: string;
          book_id?: string | null;
          number?: number;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey";
            columns: ["book_id"];
            referencedRelation: "books";
            referencedColumns: ["id"];
          }
        ];
      };
      lines: {
        Row: {
          id: string;
          chapter_id: string | null;
          line_number: number;
          text: string;
        };
        Insert: {
          id?: string;
          chapter_id?: string | null;
          line_number: number;
          text: string;
        };
        Update: {
          id?: string;
          chapter_id?: string | null;
          line_number?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lines_chapter_id_fkey";
            columns: ["chapter_id"];
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          }
        ];
      };
      vocab_cards: {
        Row: {
          id: string;
          line_id: string | null;
          word: string;
          definition: string;
          etymology: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          line_id?: string | null;
          word: string;
          definition: string;
          etymology?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          line_id?: string | null;
          word?: string;
          definition?: string;
          etymology?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vocab_cards_line_id_fkey";
            columns: ["line_id"];
            referencedRelation: "lines";
            referencedColumns: ["id"];
          }
        ];
      };
      annotation_history: {
        Row: {
          id: string;
          session_id: string;
          chapter_id: string | null;
          line_start: number | null;
          line_end: number | null;
          passage: string;
          knowledge_level: string;
          annotation_content: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          chapter_id?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          passage: string;
          knowledge_level: string;
          annotation_content: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          chapter_id?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          passage?: string;
          knowledge_level?: string;
          annotation_content?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "annotation_history_chapter_id_fkey";
            columns: ["chapter_id"];
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SupabaseDbClient = SupabaseClient<Database>;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSupabaseUrl(): string {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

function getSupabaseAnonOrPublishableKey(): string {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!anon && !publishable) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY fallback)"
    );
  }
  return anon ?? publishable!;
}

export function createSupabaseServerClient(): SupabaseDbClient {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? getSupabaseAnonOrPublishableKey();

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseScriptClient(): SupabaseDbClient {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? getSupabaseAnonOrPublishableKey();

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
