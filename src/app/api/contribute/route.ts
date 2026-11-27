import { NextResponse } from "next/server";
import {
  validateTrimmedString,
  verifySubjectExists,
  type ValidationResult,
} from "@/lib/contributionValidation";
import {
  isSupabaseConfigured,
  supabase,
  type Contribution,
} from "@/lib/supabase";

const MAX_BODY_BYTES = 4096;
const VALID_RESOURCE_TYPES = ["MID_PAPER", "ASSIGNMENT", "NOTES"] as const;
type ResourceType = Contribution["resource_type"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidResourceType(value: unknown): value is ResourceType {
  return (
    typeof value === "string" &&
    (VALID_RESOURCE_TYPES as readonly string[]).includes(value)
  );
}

function validateContributionBody(
  body: unknown
): ValidationResult<Contribution> {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const studentName = validateTrimmedString(
    body.student_name,
    "student_name",
    2,
    80
  );
  if (!studentName.ok) return studentName;

  const subjectCode = validateTrimmedString(
    body.subject_code,
    "subject_code",
    3,
    20
  );
  if (!subjectCode.ok) return subjectCode;

  if (!isValidResourceType(body.resource_type)) {
    return {
      ok: false,
      error: "resource_type must be one of MID_PAPER, ASSIGNMENT, or NOTES.",
    };
  }

  const resourceLinkOrNote = validateTrimmedString(
    body.resource_link_or_note,
    "resource_link_or_note",
    5,
    1000
  );
  if (!resourceLinkOrNote.ok) return resourceLinkOrNote;

  return {
    ok: true,
    data: {
      student_name: studentName.data,
      subject_code: subjectCode.data,
      resource_type: body.resource_type,
      resource_link_or_note: resourceLinkOrNote.data,
    },
  };
}

/** Handles student paper/note contribution submissions for a subject. */
export async function POST(request: Request) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Submission is too large. Please keep it under 4 KB." },
        { status: 413 }
      );
    }
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Unable to read request body." },
      { status: 400 }
    );
  }

  const byteLength = new TextEncoder().encode(rawText).byteLength;
  if (byteLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Submission is too large. Please keep it under 4 KB." },
      { status: 413 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(rawText) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const validation = validateContributionBody(rawBody);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const contribution = validation.data;

  try {
    const subjectCheck = await verifySubjectExists(contribution.subject_code);
    if (subjectCheck.dbError) {
      return NextResponse.json(
        { error: "Could not save contribution right now. Please try again." },
        { status: 500 }
      );
    }
    if (!subjectCheck.exists) {
      return NextResponse.json(
        { error: "Unknown subject code." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("contributions")
        .insert([contribution]);

      if (error) {
        console.error("[/api/contribute] Supabase insert error:", error);
        return NextResponse.json(
          { error: "Could not save contribution right now. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, mode: "supabase" }, { status: 201 });
    }
  } catch (err) {
    console.error("[/api/contribute] Unexpected error:", err);
    return NextResponse.json(
      { error: "Could not save contribution right now. Please try again." },
      { status: 500 }
    );
  }

  console.info("[/api/contribute] Mock contribution saved:", {
    subject_code: contribution.subject_code,
    resource_type: contribution.resource_type,
  });
  return NextResponse.json({ ok: true, mode: "mock" }, { status: 201 });
}
