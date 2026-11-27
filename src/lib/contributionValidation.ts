import { getMockSubjects } from "@/data/mockData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Validates that `value` is a string whose trimmed length falls within [minLen, maxLen]. */
export function validateTrimmedString(
  value: unknown,
  fieldName: string,
  minLen: number,
  maxLen: number
): ValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: `${fieldName} must be a non-empty string.` };
  }

  const trimmed = value.trim();
  if (trimmed.length < minLen || trimmed.length > maxLen) {
    return {
      ok: false,
      error: `${fieldName} must be between ${minLen} and ${maxLen} characters.`,
    };
  }

  return { ok: true, data: trimmed };
}

/** Checks whether `subjectCode` exists in Supabase (when configured) or mock data. */
export async function verifySubjectExists(
  subjectCode: string
): Promise<{ exists: boolean; dbError: boolean }> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("subjects")
      .select("code")
      .eq("code", subjectCode)
      .maybeSingle();

    if (error) {
      console.error("[verifySubjectExists] Supabase lookup error:", error);
      return { exists: false, dbError: true };
    }

    return { exists: Boolean(data), dbError: false };
  }

  const existsInMock = getMockSubjects().some(
    (subject) => subject.code === subjectCode
  );
  return { exists: existsInMock, dbError: false };
}
