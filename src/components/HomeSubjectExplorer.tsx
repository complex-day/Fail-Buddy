"use client";

import { useState } from "react";
import { FilterX } from "lucide-react";
import type { Subject } from "@/lib/supabase";
import SubjectCard from "@/components/SubjectCard";

interface HomeSubjectExplorerProps {
  subjects: Subject[];
}

const BRANCH_OPTIONS = ["All", "CSE", "IT"] as const;
type BranchFilter = (typeof BRANCH_OPTIONS)[number];

export default function HomeSubjectExplorer({
  subjects,
}: HomeSubjectExplorerProps) {
  const [selectedBranch, setSelectedBranch] = useState<BranchFilter>("All");
  const [selectedSem, setSelectedSem] = useState<number | null>(3);

  const filteredSubjects = subjects.filter((subject) => {
    const matchesBranch =
      selectedBranch === "All" || subject.branch === selectedBranch;
    const matchesSem = selectedSem === null || subject.semester === selectedSem;
    return matchesBranch && matchesSem;
  });

  return (
    <section aria-label="GTU Subjects" className="mt-5">
      <div className="flex items-center justify-between gap-2">
        <div
          className="inline-flex rounded-xl bg-slate-200/70 p-1"
          role="group"
          aria-label="Filter by branch"
        >
          {BRANCH_OPTIONS.map((branch) => {
            const isActive = selectedBranch === branch;
            return (
              <button
                key={branch}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedBranch(branch)}
                className={`rounded-lg px-3 py-1 text-xs transition cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "font-medium text-slate-600 hover:text-slate-900"
                }`}
              >
                {branch}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={selectedSem === 3}
          onClick={() => setSelectedSem((prev) => (prev === 3 ? null : 3))}
          className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold transition cursor-pointer ${
            selectedSem === 3
              ? "border-slate-200 bg-white text-slate-700 shadow-2xs"
              : "border-slate-200/70 bg-slate-100/70 text-slate-500 hover:text-slate-700"
          }`}
        >
          Sem 3
        </button>
      </div>

      <div className="mt-3.5 space-y-3">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <SubjectCard key={subject.code} subject={subject} />
          ))
        ) : (
          <div className="card-elevated rounded-2xl p-6 text-center">
            <FilterX
              className="mx-auto h-6 w-6 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              No subjects match this filter
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try switching back to All branches for Sem 3.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBranch("All");
                setSelectedSem(3);
              }}
              className="mt-3 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
