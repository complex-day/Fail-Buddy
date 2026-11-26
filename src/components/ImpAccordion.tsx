"use client";

import { useId, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { Material } from "@/lib/supabase";

interface ImpAccordionProps {
  material: Material;
  defaultOpen?: boolean;
}

export default function ImpAccordion({
  material,
  defaultOpen = false,
}: ImpAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <article className="card-elevated rounded-2xl overflow-hidden transition">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 text-left cursor-pointer hover:bg-slate-50/60 active:bg-slate-50 transition"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold text-slate-500">
            UNIT {material.unit}
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            {material.proof_tag}
          </span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug text-left">
            {material.question}
          </h3>
          <ChevronDown
            className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="border-t border-slate-100 px-4 pt-3.5 pb-4 bg-slate-50/40"
        >
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
      )}
    </article>
  );
}
