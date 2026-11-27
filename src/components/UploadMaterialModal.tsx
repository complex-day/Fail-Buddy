"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Send,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import type { Subject } from "@/lib/supabase";

interface UploadMaterialModalProps {
  isOpen: boolean;
  subjects: Subject[];
  defaultSubjectCode?: string;
  onClose: () => void;
}

type UploadResourceType = "MID_PAPER" | "NOTES";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SUBMIT_TIMEOUT_MS = 12_000;
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const;
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const RESOURCE_OPTIONS: { value: UploadResourceType; label: string }[] = [
  { value: "MID_PAPER", label: "GTU Past Paper" },
  { value: "NOTES", label: "Notes / IMPs" },
];

function isOkPayload(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "ok" in data &&
    (data as { ok: unknown }).ok === true
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSupportedFile(file: File): boolean {
  const mime = file.type.trim().toLowerCase();
  if ((ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)) {
    return true;
  }
  if (!mime) {
    const lowerName = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  }
  return false;
}

export default function UploadMaterialModal({
  isOpen,
  subjects,
  defaultSubjectCode,
  onClose,
}: UploadMaterialModalProps) {
  const initialSubject =
    defaultSubjectCode || subjects[0]?.code || "";

  const [subjectCode, setSubjectCode] = useState(initialSubject);
  const [studentName, setStudentName] = useState("");
  const [resourceType, setResourceType] =
    useState<UploadResourceType>("MID_PAPER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const subjectSelectId = useId();
  const nameInputId = useId();
  const fileInputId = useId();

  useEffect(() => {
    if (!isOpen) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    setSubjectCode(defaultSubjectCode || subjects[0]?.code || "");
    setErrorMsg(null);
    setIsSuccess(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, defaultSubjectCode, subjects, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleFileSelection(file: File | null) {
    if (!file) return;

    if (!isSupportedFile(file)) {
      setErrorMsg("Only PDF, JPG, PNG, or WEBP files are supported.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      setErrorMsg("File must be under 10 MB.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleCloseAndReset() {
    clearSelectedFile();
    setErrorMsg(null);
    setIsSuccess(false);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = studentName.trim();
    if (!subjectCode) {
      setErrorMsg("Please select a GTU subject.");
      return;
    }
    if (trimmedName.length < 2) {
      setErrorMsg("Please enter your name (at least 2 characters).");
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Please choose a PDF or photo (max 10 MB) to upload.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let didTimeout = false;

    timeoutRef.current = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, SUBMIT_TIMEOUT_MS);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("student_name", trimmedName);
      formData.append("subject_code", subjectCode);
      formData.append("resource_type", resourceType);

      const response = await fetch("/api/upload", {
        method: "POST",
        signal: controller.signal,
        body: formData,
      });

      if (!response.ok) {
        let serverError = "Could not upload file. Please try again.";
        try {
          const data: unknown = await response.json();
          if (
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string" &&
            data.error.trim().length > 0
          ) {
            serverError = data.error;
          }
        } catch {
          // Ignore non-JSON error responses
        }
        setErrorMsg(serverError);
        return;
      }

      let successData: unknown = null;
      try {
        successData = await response.json();
      } catch {
        setErrorMsg(
          "Unexpected server response. Please check your connection and try again."
        );
        return;
      }

      if (!isOkPayload(successData)) {
        setErrorMsg(
          "Unexpected server response. Please check your connection and try again."
        );
        return;
      }

      setStudentName("");
      clearSelectedFile();
      setIsSuccess(true);
    } catch (err) {
      if (didTimeout) {
        setErrorMsg(
          "Upload timed out. Please check your mobile data or Wi-Fi and try again."
        );
      } else if (err instanceof DOMException && err.name === "AbortError") {
        // Modal closed or unmounted while upload was in flight
      } else {
        setErrorMsg(
          "Network error while uploading. Please check your connection and try again."
        );
      }
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleCloseAndReset();
        }
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-2xl border-t border-slate-200 max-h-[90dvh] overflow-y-auto">
        {/* Top drag handle + close button */}
        <div className="relative flex min-h-[44px] items-center justify-center pb-2">
          <span
            aria-hidden="true"
            className="h-1 w-10 rounded-full bg-slate-300"
          />
          <button
            type="button"
            aria-label="Close upload modal"
            onClick={handleCloseAndReset}
            className="absolute right-0 top-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 active:scale-[0.96] transition cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
            <UploadCloud
              className="h-3 w-3 text-emerald-600"
              aria-hidden="true"
            />
            DIRECT UPLOAD · MAX 10 MB
          </span>

          <h2
            id={titleId}
            className="mt-2.5 text-lg font-extrabold tracking-tight text-slate-900"
          >
            Upload GTU Paper or Notes
          </h2>
          <p className="mt-1 text-sm text-slate-500 leading-snug">
            Share a PYQ PDF or handwritten note photo to help GTU students pass
            their 70-mark external exam.
          </p>
        </div>

        {isSuccess ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-bold text-emerald-900">
                    Uploaded! Thanks for helping GTU students.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                    Your contribution has been saved for {subjectCode}.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseAndReset}
              className="flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
            <div>
              <label
                htmlFor={subjectSelectId}
                className="block text-xs font-semibold text-slate-700"
              >
                GTU Subject
              </label>
              <select
                id={subjectSelectId}
                value={subjectCode}
                onChange={(event) => {
                  setSubjectCode(event.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects available</option>
                ) : (
                  subjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} — {subject.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor={nameInputId}
                className="block text-xs font-semibold text-slate-700"
              >
                Your Name
              </label>
              <input
                id={nameInputId}
                type="text"
                value={studentName}
                onChange={(event) => {
                  setStudentName(event.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Meet Patel"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">
                Material Type
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {RESOURCE_OPTIONS.map((option) => {
                  const isSelected = resourceType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setResourceType(option.value)}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor={fileInputId}
                className="block text-xs font-semibold text-slate-700"
              >
                PDF or Photo (Max 10 MB)
              </label>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  handleFileSelection(file);
                }}
                className="sr-only"
              />

              {selectedFile ? (
                <div className="mt-1.5 card-elevated rounded-2xl border-dashed border-emerald-300 bg-emerald-50/40 p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      {selectedFile.type === "application/pdf" ||
                      selectedFile.name.toLowerCase().endsWith(".pdf") ? (
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {selectedFile.name}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove selected file"
                    onClick={clearSelectedFile}
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 active:scale-[0.96] transition cursor-pointer"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    const file = event.dataTransfer.files?.[0] ?? null;
                    handleFileSelection(file);
                  }}
                  className={`mt-1.5 card-elevated flex min-h-[88px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-4 text-center transition cursor-pointer ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/70"
                  }`}
                >
                  <Upload
                    className="h-5 w-5 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    Tap to choose PDF or photo
                  </span>
                  <span className="text-xs text-slate-500">
                    PDF, JPG, PNG, WEBP · Up to 10 MB
                  </span>
                </button>
              )}
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || subjects.length === 0}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.98] transition cursor-pointer"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Uploading..." : "Upload & Help Classmates"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
