import { getMockSubjects, MOCK_MATERIALS } from "@/data/mockData";
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
  const subject = getMockSubjects().find((item) => item.code === code) ?? null;
  const materials = subject
    ? MOCK_MATERIALS.filter((item) => item.subject_code === code).sort(
        (a, b) => a.unit - b.unit || a.id - b.id
      )
    : [];
  return { subject, materials };
}

/** Fetch all GTU subjects ordered by nearest exam date, falling back to mock data on error. */
export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured) {
    return getMockSubjects();
  }

  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("exam_date", { ascending: true });

    if (error) {
      console.warn(
        "[data.getSubjects] Falling back to mock subjects:",
        error.message
      );
      return getMockSubjects();
    }

    return data ?? [];
  } catch (err) {
    console.warn("[data.getSubjects] Falling back to mock subjects:", err);
    return getMockSubjects();
  }
}

/** Fetch a single GTU subject and its ordered materials by code, falling back on error. */
export async function getSubjectWithMaterials(code: string): Promise<{
  subject: Subject | null;
  materials: Material[];
}> {
  const normalizedCode = code.trim();
  if (!normalizedCode) {
    return { subject: null, materials: [] };
  }

  if (!isSupabaseConfigured) {
    return getMockSubjectWithMaterials(normalizedCode);
  }

  try {
    const [subjectRes, materialsRes] = await Promise.all([
      supabase
        .from("subjects")
        .select("*")
        .eq("code", normalizedCode)
        .maybeSingle(),
      supabase
        .from("materials")
        .select("*")
        .eq("subject_code", normalizedCode)
        .order("unit", { ascending: true })
        .order("id", { ascending: true }),
    ]);

    if (subjectRes.error) {
      console.warn(
        "[data.getSubjectWithMaterials] Subject query failed; falling back to mock data:",
        subjectRes.error.message
      );
      return getMockSubjectWithMaterials(normalizedCode);
    }

    if (!subjectRes.data) {
      return { subject: null, materials: [] };
    }

    if (materialsRes.error) {
      console.warn(
        "[data.getSubjectWithMaterials] Materials query failed; returning subject with empty materials:",
        materialsRes.error.message
      );
      return {
        subject: subjectRes.data,
        materials: [],
      };
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
    return getMockSubjectWithMaterials(normalizedCode);
  }
}
