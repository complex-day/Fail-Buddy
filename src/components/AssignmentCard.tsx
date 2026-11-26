"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import type { Material } from "@/lib/supabase";

interface AssignmentCardProps {
  material: Material;
}

export default function AssignmentCard({ material }: AssignmentCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    const textToCopy = `${material.question}\n\n${material.answer}`;
    let didCopy = false;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        didCopy = true;
      } catch {
        didCopy = false;
      }
    }

    if (!didCopy && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textToCopy.length);
        didCopy = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        didCopy = false;
      }
    }

    if (didCopy) {
      setCopied(true);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article className="card-elevated rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          ASSIGNMENT · UNIT {material.unit}
        </span>
        <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
          {material.proof_tag}
        </span>
      </div>

      <h3 className="mt-2.5 text-[15px] font-bold text-slate-900 leading-snug">
        {material.question}
      </h3>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">
          {material.answer}
        </p>

        {material.topper_tip && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5 text-[13px] text-indigo-800">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900">
              <Sparkles
                className="h-3.5 w-3.5 shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <span>Topper Exam Tip</span>
            </div>
            <p className="mt-1 leading-relaxed">{material.topper_tip}</p>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-end border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold active:scale-[0.98] transition cursor-pointer ${
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy Answer
            </>
          )}
        </button>
      </div>
    </article>
  );
}
