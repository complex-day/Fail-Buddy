"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  LockOpen,
  ShieldCheck,
} from "lucide-react";
import { formatCountdownBadge } from "@/lib/date";
import type { Material, Subject } from "@/lib/supabase";
import AssignmentCard from "@/components/AssignmentCard";
import DailyTracker from "@/components/DailyTracker";
import ImpAccordion from "@/components/ImpAccordion";
import UnlockModal from "@/components/UnlockModal";

interface SubjectHubProps {
  subject: Subject;
  materials: Material[];
  todayISO?: string;
}

type HubTab = "PASSING_KIT" | "ASSIGNMENTS" | "DAILY_PLAN";

const TABS: { id: HubTab; label: string }[] = [
  { id: "PASSING_KIT", label: "Passing Kit" },
  { id: "ASSIGNMENTS", label: "Assignments" },
  { id: "DAILY_PLAN", label: "Daily Plan" },
];

interface LockedMaterialCardProps {
  material: Material;
  onUnlock: () => void;
}

function LockedMaterialCard({ material, onUnlock }: LockedMaterialCardProps) {
  const isAssignment = material.type === "ASSIGNMENT";
  const unitLabel = isAssignment
    ? `ASSIGNMENT · UNIT ${material.unit}`
    : `UNIT ${material.unit}`;
  const badgeLabel = isAssignment ? "Locked Assignment" : "Locked IMP";

  return (
    <article className="card-elevated rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {unitLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
          <Lock className="h-3 w-3" aria-hidden="true" />
          {badgeLabel}
        </span>
      </div>

      <div className="mt-2.5 flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
            {material.question}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {material.proof_tag} • Full answer &amp; topper tip locked
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">
          Share 1 note or mid-sem paper
        </span>
        <button
          type="button"
          onClick={onUnlock}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
        >
          <LockOpen
            className="h-3.5 w-3.5 text-emerald-400"
            aria-hidden="true"
          />
          Unlock Free
        </button>
      </div>
    </article>
  );
}

export default function SubjectHub({
  subject,
  materials,
  todayISO,
}: SubjectHubProps) {
  const unlockStorageKey = `fail_buddy_unlocked_${subject.code}`;

  const [activeTab, setActiveTab] = useState<HubTab>("PASSING_KIT");
  const [mustDoOnly, setMustDoOnly] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const countdown = formatCountdownBadge(subject.exam_date, todayISO);

  const impMaterials = materials.filter((item) => item.type === "IMP");
  const assignmentMaterials = materials.filter(
    (item) => item.type === "ASSIGNMENT"
  );
  const visibleImps = mustDoOnly
    ? impMaterials.filter((item) => item.is_must_do)
    : impMaterials;
  const lockedMaterials = materials.filter((item) => item.is_locked);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(unlockStorageKey);
      setIsUnlocked(saved === "true");
    } catch {
      setIsUnlocked(false);
    }
  }, [unlockStorageKey]);

  function handleUnlocked(
    _method: "WHATSAPP" | "CONTRIBUTE",
    _contributorName?: string
  ) {
    void _method;
    void _contributorName;
    setIsUnlocked(true);
    setIsUnlockModalOpen(false);
    try {
      window.localStorage.setItem(unlockStorageKey, "true");
    } catch {
      // Ignore storage write errors in restricted in-app browsers
    }
  }

  const showFloatingUnlockDock = !isUnlocked && lockedMaterials.length > 0;

  return (
    <div className="min-h-dvh bg-pixel-canvas text-slate-900">
      <main
        className={`max-w-md mx-auto px-4 pt-4 ${
          showFloatingUnlockDock ? "pb-28" : "pb-12"
        }`}
      >
        {/* Compact Top Bar */}
        <header className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              aria-label="Back to subjects"
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 hover:text-slate-900 active:scale-[0.97] transition"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>

            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-slate-900 truncate leading-tight">
                {subject.name}
              </h1>
              <p className="font-mono text-xs text-slate-500">{subject.code}</p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              countdown.urgent
                ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {countdown.label}
          </span>
        </header>

        {/* Optical Lens Topper Strip */}
        <section
          aria-label="Topper verification"
          className="mt-3 relative overflow-hidden rounded-2xl"
        >
          <div aria-hidden="true" className="absolute -inset-4 lens-orb" />
          <div className="relative rounded-2xl lens-glass px-3.5 py-2.5 flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-indigo-600"
              aria-hidden="true"
            />
            <p className="text-[12.5px] leading-snug font-medium text-slate-700">
              Verified by {subject.topper_name} • Assignments &amp; Past Papers
            </p>
          </div>
        </section>

        {/* Subtle Emerald Unlock Confirmation Banner */}
        {isUnlocked && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              Full Passing Kit Unlocked — Good luck for {subject.code}!
            </span>
          </div>
        )}

        {/* 3-Tab Segmented Switcher */}
        <div
          className="mt-4 grid grid-cols-3 rounded-xl bg-slate-200/70 p-1"
          role="tablist"
          aria-label="Subject study sections"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] rounded-lg px-2 py-2 text-xs transition cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "font-medium text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Passing Kit */}
        {activeTab === "PASSING_KIT" && (
          <section aria-label="Zero-Fail Passing Kit" className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={mustDoOnly}
                onClick={() => setMustDoOnly((prev) => !prev)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition cursor-pointer active:scale-[0.98] ${
                  mustDoOnly
                    ? "border-emerald-200/90 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                    mustDoOnly ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-2xs transition-transform ${
                      mustDoOnly ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </span>
                <span>Must-Do Only ({subject.passing_target})</span>
              </button>

              <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                {visibleImps.length} IMPs
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {visibleImps.length > 0 ? (
                visibleImps.map((material) =>
                  material.is_locked && !isUnlocked ? (
                    <LockedMaterialCard
                      key={material.id}
                      material={material}
                      onUnlock={() => setIsUnlockModalOpen(true)}
                    />
                  ) : (
                    <ImpAccordion key={material.id} material={material} />
                  )
                )
              ) : mustDoOnly && impMaterials.length > 0 ? (
                <div className="card-elevated rounded-2xl p-6 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    No Must-Do IMPs flagged yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    All {impMaterials.length} questions for {subject.code} are
                    available when the Must-Do filter is turned off.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMustDoOnly(false)}
                    className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
                  >
                    Show all IMPs
                  </button>
                </div>
              ) : (
                <div className="card-elevated rounded-2xl p-6 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    No IMP questions added yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Check back soon for verified questions in {subject.code}.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Assignments */}
        {activeTab === "ASSIGNMENTS" && (
          <section aria-label="Assignment Solutions" className="mt-4 space-y-3">
            {assignmentMaterials.length > 0 ? (
              assignmentMaterials.map((material) =>
                material.is_locked && !isUnlocked ? (
                  <LockedMaterialCard
                    key={material.id}
                    material={material}
                    onUnlock={() => setIsUnlockModalOpen(true)}
                  />
                ) : (
                  <AssignmentCard key={material.id} material={material} />
                )
              )
            ) : (
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-base font-bold text-slate-900">
                  No assignments added yet
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Verified college assignment solutions for {subject.code} will
                  appear here once contributed.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Anti-Panic Daily Tracker */}
        {activeTab === "DAILY_PLAN" && (
          <section aria-label="Anti-Panic Daily Tracker" className="mt-4">
            <DailyTracker
              subject={subject}
              impMaterials={impMaterials}
              todayISO={todayISO}
              isUnlocked={isUnlocked}
            />
          </section>
        )}
      </main>

      {/* Floating Glass Bottom Dock when locked items exist and kit is not yet unlocked */}
      {showFloatingUnlockDock && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-20 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsUnlockModalOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900/95 backdrop-blur-md px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.45)] ring-1 ring-white/10 active:scale-[0.98] transition cursor-pointer"
            >
              <LockOpen
                className="h-4 w-4 text-emerald-400"
                aria-hidden="true"
              />
              Unlock Remaining IMPs (Free)
            </button>
          </div>
        </div>
      )}

      <UnlockModal
        isOpen={isUnlockModalOpen}
        subject={subject}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlocked={handleUnlocked}
      />
    </div>
  );
}
