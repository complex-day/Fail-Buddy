"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CheckCircle2,
  LockOpen,
  MessageCircleHeart,
  Send,
  X,
} from "lucide-react";
import type { Contribution, Subject } from "@/lib/supabase";

interface UnlockModalProps {
  isOpen: boolean;
  subject: Subject;
  onClose: () => void;
  onUnlocked: (
    method: "WHATSAPP" | "CONTRIBUTE",
    contributorName?: string
  ) => void;
}

type ModalOption = "WHATSAPP" | "CONTRIBUTE";
type ResourceType = Contribution["resource_type"];

const SUBMIT_TIMEOUT_MS = 12_000;

const RESOURCE_OPTIONS: { value: ResourceType; label: string }[] = [
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

export default function UnlockModal({
  isOpen,
  subject,
  onClose,
  onUnlocked,
}: UnlockModalProps) {
  const [activeOption, setActiveOption] = useState<ModalOption>("WHATSAPP");
  const [studentName, setStudentName] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("MID_PAPER");
  const [resourceValue, setResourceValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

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

    setShareUrl(window.location.href);

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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const shareMessage = [
    `Bhai/Behen, ${subject.name} (${subject.code}) ka GTU External 23/70 Passing Kit + IMPs mil gaya (no login)!`,
    shareUrl,
  ]
    .filter(Boolean)
    .join(" ");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  async function handleContributeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = studentName.trim();
    const trimmedResource = resourceValue.trim();

    if (trimmedName.length < 2) {
      setErrorMsg("Please enter your name (at least 2 characters).");
      return;
    }
    if (trimmedResource.length < 5) {
      setErrorMsg(
        "Please paste a Google Drive link or write at least 5 characters."
      );
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
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          student_name: trimmedName,
          subject_code: subject.code,
          resource_type: resourceType,
          resource_link_or_note: trimmedResource,
        }),
      });

      if (!response.ok) {
        let serverError = "Could not save contribution. Please try again.";
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
      setResourceValue("");
      onUnlocked("CONTRIBUTE", trimmedName);
    } catch (err) {
      if (didTimeout) {
        setErrorMsg(
          "Request timed out. Please check your mobile data or Wi-Fi and try again."
        );
      } else if (err instanceof DOMException && err.name === "AbortError") {
        // Modal closed or unmounted while request was in flight
      } else {
        setErrorMsg(
          "Network error while submitting. Please check your connection and try again."
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
          onClose();
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
            aria-label="Close unlock modal"
            onClick={onClose}
            className="absolute right-0 top-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 active:scale-[0.96] transition cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-purple-700">
            <LockOpen
              className="h-3 w-3 text-emerald-600"
              aria-hidden="true"
            />
            FREE BARTER UNLOCK
          </span>

          <h2
            id={titleId}
            className="mt-2.5 text-lg font-extrabold tracking-tight text-slate-900"
          >
            Unlock All GTU IMPs
          </h2>
          <p className="mt-1 text-sm text-slate-500 leading-snug">
            Zero rupees, zero login. Help 1 classmate to unlock the full{" "}
            <span className="font-mono font-semibold text-slate-700">
              {subject.code}
            </span>{" "}
            passing kit.
          </p>
        </div>

        {/* 2-Option Switcher */}
        <div
          role="tablist"
          aria-label="Choose unlock method"
          className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeOption === "WHATSAPP"}
            onClick={() => {
              setActiveOption("WHATSAPP");
              setErrorMsg(null);
            }}
            className={`min-h-[44px] rounded-lg px-2.5 py-2 text-xs transition cursor-pointer ${
              activeOption === "WHATSAPP"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Share WhatsApp
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeOption === "CONTRIBUTE"}
            onClick={() => {
              setActiveOption("CONTRIBUTE");
              setErrorMsg(null);
            }}
            className={`min-h-[44px] rounded-lg px-2.5 py-2 text-xs transition cursor-pointer ${
              activeOption === "CONTRIBUTE"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Contribute Paper
          </button>
        </div>

        {/* Option 1: Instant WhatsApp Share */}
        {activeOption === "WHATSAPP" && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div className="text-xs leading-relaxed text-emerald-900">
                  <p className="font-semibold">Instant 1-Tap Barter</p>
                  <p className="mt-0.5 text-emerald-800/90">
                    Share {subject.name} ({subject.code}) with your college
                    group so classmates pass GTU External — everything unlocks
                    right away.
                  </p>
                </div>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onUnlocked("WHATSAPP")}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
            >
              <MessageCircleHeart
                className="h-4 w-4 text-emerald-400"
                aria-hidden="true"
              />
              Share in College WhatsApp Group
            </a>

            <p className="text-center text-xs text-slate-500">
              Prefer sharing a GTU past paper or notes? Switch to{" "}
              <button
                type="button"
                onClick={() => setActiveOption("CONTRIBUTE")}
                className="inline-flex min-h-[44px] items-center px-1 font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Contribute Paper
              </button>
            </p>
          </div>
        )}

        {/* Option 2: Contribute Paper / Notes */}
        {activeOption === "CONTRIBUTE" && (
          <form
            onSubmit={handleContributeSubmit}
            noValidate
            className="mt-4 space-y-3"
          >
            <div>
              <label
                htmlFor="fb-student-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Your Name
              </label>
              <input
                id="fb-student-name"
                type="text"
                value={studentName}
                onChange={(event) => {
                  setStudentName(event.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Meet Patel"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">
                Resource Type
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
                htmlFor="fb-resource-note"
                className="block text-xs font-semibold text-slate-700"
              >
                Google Drive Link or Quick Note
              </label>
              <textarea
                id="fb-resource-note"
                rows={3}
                value={resourceValue}
                onChange={(event) => {
                  setResourceValue(event.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Paste Drive link or share a repeated GTU question / quick tip..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
              />
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
              disabled={isSubmitting}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.98] transition cursor-pointer"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Unlocking..." : "Submit & Unlock Instantly"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
