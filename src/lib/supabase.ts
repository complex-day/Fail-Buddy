import { createClient } from "@supabase/supabase-js";

export interface Subject {
  code: string;
  name: string;
  branch: string;
  semester: number;
  exam_date: string;
  passing_target: string;
  topper_name: string;
  unlocked_by: string[];
}

export interface Material {
  id: number;
  subject_code: string;
  type: "IMP" | "ASSIGNMENT";
  unit: number;
  question: string;
  answer: string;
  proof_tag: string;
  topper_tip: string | null;
  is_must_do: boolean;
  is_locked: boolean;
}

export interface Contribution {
  id?: number;
  student_name: string;
  subject_code: string;
  resource_type: "MID_PAPER" | "ASSIGNMENT" | "NOTES";
  resource_link_or_note: string;
  created_at?: string;
}

type TableRow<T> = {
  [K in keyof T]: T[K];
};

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: TableRow<Subject>;
        Insert: TableRow<Omit<Subject, "unlocked_by"> & { unlocked_by?: string[] }>;
        Update: TableRow<Partial<Subject>>;
        Relationships: [];
      };
      materials: {
        Row: TableRow<Material>;
        Insert: TableRow<
          Omit<Material, "id" | "topper_tip" | "is_must_do" | "is_locked"> & {
            id?: number;
            topper_tip?: string | null;
            is_must_do?: boolean;
            is_locked?: boolean;
          }
        >;
        Update: TableRow<Partial<Material>>;
        Relationships: [];
      };
      contributions: {
        Row: TableRow<Contribution>;
        Insert: TableRow<Contribution>;
        Update: TableRow<Partial<Contribution>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback placeholder prevents createClient() from throwing at import/build time before .env.local is configured.
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
