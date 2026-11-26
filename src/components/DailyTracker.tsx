"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { getClampedDaysLeft } from "@/lib/date";
import type { Material, Subject } from "@/lib/supabase";

interface DailyTrackerProps {
  subject: Subject;
  impMaterials: Material[];
  todayISO?: string;
  isUnlocked?: boolean;
}

const TOTAL_METER_BLOCKS = 10;

function splitIntoDayPlans(
  materials: Material[],
  daysLeft: number
): { day: number; items: Material[] }[] {
  if (materials.length === 0) return [];

  const activeDays = Math.max(1, Math.min(daysLeft, materials.length));
  const baseCount = Math.floor(materials.length / activeDays);
  const extraCount = materials.length % activeDays;

  const plan: { day: number; items: Material[] }[] = [];
  let cursor = 0;

  for (let i = 0; i < activeDays; i++) {
    const chunkSize = baseCount + (i < extraCount ? 1 : 0);
    plan.push({
      day: i + 1,
      items: materials.slice(cursor, cursor + chunkSize),
    });
    cursor += chunkSize;
  }

  return plan;
}

export default function DailyTracker({
  subject,
  impMaterials,
  todayISO,
  isUnlocked = false,
}: DailyTrackerProps) {
  const storageKey = `fail_buddy_tracker_${subject.code}`;
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedIds(
            parsed.filter(
              (id): id is number =>
                typeof id === "number" && Number.isInteger(id) && id > 0
            )
          );
          return;
        }
      }
      setCompletedIds([]);
    } catch {
      setCompletedIds([]);
    }
  }, [storageKey]);

  const mustDoImps = impMaterials.filter((item) => item.is_must_do);
  const targetImps = mustDoImps.length > 0 ? mustDoImps : impMaterials;
  const daysLeft = getClampedDaysLeft(subject.exam_date, todayISO);
  const dayPlans = splitIntoDayPlans(targetImps, daysLeft);

  const completedSet = new Set(completedIds);
  const totalCount = targetImps.length;
  const doneCount = targetImps.filter((item) =>
    completedSet.has(item.id)
  ).length;
  const filledBlocks =
    totalCount > 0
      ? Math.round((doneCount / totalCount) * TOTAL_METER_BLOCKS)
      : 0;

  function toggleTask(materialId: number) {
    setCompletedIds((prev) => {
      const next = prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId];
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage write errors in restricted in-app browsers
      }
      return next;
    });
  }

  if (targetImps.length === 0) {
    return (
      <div className="card-elevated rounded-2xl p-6 text-center">
        <p className="text-sm font-semibold text-slate-800">
          No study tasks scheduled yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Must-Do IMPs will appear here automatically once added.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Progress Card */}
      <div className="card-elevated rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Anti-Panic Study Plan
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {dayPlans.length}-day micro-sprint · {subject.passing_target}{" "}
              target
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-700 shrink-0">
            {doneCount}/{totalCount} Done
          </span>
        </div>

        <div className="mt-3 grid grid-cols-10 gap-1" aria-hidden="true">
          {Array.from({ length: TOTAL_METER_BLOCKS }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-[2px] transition-colors ${
                index < filledBlocks ? "bg-emerald-500" : "bg-slate-200/90"
              }`}
            />
          ))}
        </div>

        {doneCount === totalCount && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            All Must-Do IMPs cleared — you&apos;re ready to pass {subject.code}!
          </div>
        )}
      </div>

      {/* Day-by-Day Micro-Task Cards */}
      {dayPlans.map((plan) => {
        const dayDone = plan.items.filter((item) =>
          completedSet.has(item.id)
        ).length;
        const allDayDone = dayDone === plan.items.length;

        return (
          <section
            key={plan.day}
            aria-label={`Day ${plan.day} study tasks`}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700">
                DAY {plan.day}
              </span>
              <span
                className={`font-mono text-[11px] font-semibold ${
                  allDayDone ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {dayDone}/{plan.items.length} Done
              </span>
            </div>

            <div className="mt-1.5 divide-y divide-slate-100">
              {plan.items.map((item) => {
                const isChecked = completedSet.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleTask(item.id)}
                    className="w-full min-h-[44px] py-2.5 px-2 -mx-2 rounded-xl flex items-start gap-3 text-left hover:bg-slate-50/80 active:bg-slate-100/70 transition cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`block text-base font-medium leading-snug break-words transition ${
                          isChecked
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {item.question}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] font-medium text-slate-400">
                        UNIT {item.unit}
                        {item.is_locked && !isUnlocked ? " · LOCKED" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
