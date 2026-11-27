import { NextResponse } from "next/server";
import {
  validateTrimmedString,
  verifySubjectExists,
} from "@/lib/contributionValidation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;
const STORAGE_BUCKET = "student-uploads";

const ALLOWED_RESOURCE_TYPES = ["MID_PAPER", "NOTES"] as const;
type UploadResourceType = (typeof ALLOWED_RESOURCE_TYPES)[number];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isUploadResourceType(value: unknown): value is UploadResourceType {
  return (
    typeof value === "string" &&
    (ALLOWED_RESOURCE_TYPES as readonly string[]).includes(value)
  );
}

function isAllowedMimeType(value: string): value is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

function sanitizeFileName(rawName: string, mimeType: AllowedMimeType): string {
  const baseName = rawName.split(/[/\\]/).pop() ?? "";
  const stemWithoutExt = baseName.trim().toLowerCase().replace(/\.[^/.]+$/, "");
  const cleaned = stemWithoutExt
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

  const ext = MIME_TO_EXT[mimeType];
  const stem = cleaned.slice(0, 70).replace(/[.-]+$/g, "") || "upload";
  return `${stem}.${ext}`;
}

/** Handles multipart PDF/photo uploads to Supabase Storage + contributions table. */
export async function POST(request: Request) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: "Uploaded file exceeds the 10 MB limit." },
        { status: 413 }
      );
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form payload." },
      { status: 400 }
    );
  }

  const studentName = validateTrimmedString(
    formData.get("student_name"),
    "student_name",
    2,
    80
  );
  if (!studentName.ok) {
    return NextResponse.json({ error: studentName.error }, { status: 400 });
  }

  const subjectCode = validateTrimmedString(
    formData.get("subject_code"),
    "subject_code",
    3,
    20
  );
  if (!subjectCode.ok) {
    return NextResponse.json({ error: subjectCode.error }, { status: 400 });
  }

  const rawResourceType = formData.get("resource_type");
  if (!isUploadResourceType(rawResourceType)) {
    return NextResponse.json(
      { error: "resource_type must be MID_PAPER or NOTES." },
      { status: 400 }
    );
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { error: "Please attach a PDF or image file to upload." },
      { status: 400 }
    );
  }

  if (fileEntry.size <= 0 || fileEntry.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File must be larger than 0 bytes and at most 10 MB." },
      { status: 400 }
    );
  }

  const normalizedMime = fileEntry.type.trim().toLowerCase();
  if (!isAllowedMimeType(normalizedMime)) {
    return NextResponse.json(
      { error: "Only PDF, JPG, PNG, or WEBP files are supported." },
      { status: 400 }
    );
  }

  try {
    const subjectCheck = await verifySubjectExists(subjectCode.data);
    if (subjectCheck.dbError) {
      return NextResponse.json(
        { error: "Could not verify subject right now. Please try again." },
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
      const safeName = sanitizeFileName(fileEntry.name, normalizedMime);
      const storagePath = `${subjectCode.data}/${Date.now()}-${safeName}`;
      const fileBytes = new Uint8Array(await fileEntry.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBytes, {
          contentType: normalizedMime,
          upsert: false,
        });

      if (uploadError) {
        console.error("[/api/upload] Supabase Storage upload error:", uploadError);
        return NextResponse.json(
          { error: "Could not upload file right now. Please try again." },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("contributions")
        .insert([
          {
            student_name: studentName.data,
            subject_code: subjectCode.data,
            resource_type: rawResourceType,
            resource_link_or_note: publicUrl,
          },
        ]);

      if (insertError) {
        console.error("[/api/upload] Supabase insert error:", insertError);
        return NextResponse.json(
          { error: "File uploaded, but could not save record. Please retry." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { ok: true, mode: "supabase", url: publicUrl },
        { status: 201 }
      );
    }
  } catch (err) {
    console.error("[/api/upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "Could not upload file right now. Please try again." },
      { status: 500 }
    );
  }

  console.info("[/api/upload] Mock upload saved:", {
    subject_code: subjectCode.data,
    resource_type: rawResourceType,
    file_type: normalizedMime,
    file_size: fileEntry.size,
  });

  return NextResponse.json({ ok: true, mode: "mock" }, { status: 201 });
}
