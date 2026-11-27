import { createClient } from "@supabase/supabase-js";

export type Subject = {
  code: string;
  name: string;
  branch: string;
  semester: number;
  exam_date: string;
  passing_target: string;
  topper_name: string;
  topper_guidance?: string | null;
  unlocked_by: string[];
};

export type Material = {
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
};

export type Contribution = {
  id?: number;
  student_name: string;
  subject_code: string;
  resource_type: "MID_PAPER" | "ASSIGNMENT" | "NOTES";
  resource_link_or_note: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "unlocked_by"> & { unlocked_by?: string[] };
        Update: Partial<Subject>;
        Relationships: [];
      };
      materials: {
        Row: Material;
        Insert: Omit<
          Material,
          "id" | "topper_tip" | "is_must_do" | "is_locked"
        > & {
          id?: number;
          topper_tip?: string | null;
          is_must_do?: boolean;
          is_locked?: boolean;
        };
        Update: Partial<Material>;
        Relationships: [];
      };
      contributions: {
        Row: Contribution;
        Insert: Contribution;
        Update: Partial<Contribution>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback placeholder prevents createClient() from throwing at import/build time before .env.local is configured.
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
