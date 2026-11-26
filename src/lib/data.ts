import { MOCK_MATERIALS, MOCK_SUBJECTS } from "@/data/mockData";
import {
  isSupabaseConfigured,
  supabase,
  type Material,
  type Subject,
} from "@/lib/supabase";

function getMockSubjectWithMaterials(code: string): {
  subject: Subject | null;
  materials: Material[];
} {
  const subject = MOCK_SUBJECTS.find((item) => item.code === code) ?? null;
  const materials = subject
    ? MOCK_MATERIALS.filter((item) => item.subject_code === code).sort(
        (a, b) => a.unit - b.unit || a.id - b.id
      )
    : [];
  return { subject, materials };
}

/** Fetch all GTU subjects ordered by nearest exam date, falling back to mock data. */
export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured) {
    return MOCK_SUBJECTS;
  }

  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("exam_date", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }

    console.warn(
      "[data.getSubjects] Falling back to MOCK_SUBJECTS:",
      error?.message ?? "No subjects returned from Supabase"
    );
    return MOCK_SUBJECTS;
  } catch (err) {
    console.warn("[data.getSubjects] Falling back to MOCK_SUBJECTS:", err);
    return MOCK_SUBJECTS;
  }
}

/** Fetch a single GTU subject and its ordered materials by code, falling back on error. */
export async function getSubjectWithMaterials(code: string): Promise<{
  subject: Subject | null;
  materials: Material[];
}> {
  if (!isSupabaseConfigured) {
    return getMockSubjectWithMaterials(code);
  }

  try {
    const [subjectRes, materialsRes] = await Promise.all([
      supabase.from("subjects").select("*").eq("code", code).maybeSingle(),
      supabase
        .from("materials")
        .select("*")
        .eq("subject_code", code)
        .order("unit", { ascending: true })
        .order("id", { ascending: true }),
    ]);

    if (subjectRes.error || materialsRes.error) {
      console.warn(
        "[data.getSubjectWithMaterials] Falling back to mock data:",
        subjectRes.error?.message ?? materialsRes.error?.message
      );
      return getMockSubjectWithMaterials(code);
    }

    if (!subjectRes.data) {
      return { subject: null, materials: [] };
    }

    return {
      subject: subjectRes.data,
      materials: materialsRes.data ?? [],
    };
  } catch (err) {
    console.warn(
      "[data.getSubjectWithMaterials] Falling back to mock data:",
      err
    );
    return getMockSubjectWithMaterials(code);
  }
}
