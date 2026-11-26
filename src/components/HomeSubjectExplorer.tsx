"use client";

import { useMemo, useState } from "react";
import { FilterX } from "lucide-react";
import type { Subject } from "@/lib/supabase";
import SubjectCard from "@/components/SubjectCard";

interface HomeSubjectExplorerProps {
  subjects: Subject[];
  todayISO: string;
}

export default function HomeSubjectExplorer({
  subjects,
  todayISO,
}: HomeSubjectExplorerProps) {
  const branchOptions = useMemo(() => {
    const uniqueBranches = Array.from(
      new Set(subjects.map((subject) => subject.branch.trim()).filter(Boolean))
    );
    return ["All", ...uniqueBranches];
  }, [subjects]);

  const semesters = useMemo(
    () =>
      Array.from(new Set(subjects.map((subject) => subject.semester))).sort(
        (a, b) => a - b
      ),
    [subjects]
  );

  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  const activeBranch = branchOptions.includes(selectedBranch)
    ? selectedBranch
    : "All";
  const activeSem =
    semesters.length > 1 && selectedSem !== null && semesters.includes(selectedSem)
      ? selectedSem
      : null;

  const filteredSubjects = subjects.filter((subject) => {
    const matchesBranch =
      activeBranch === "All" || subject.branch === activeBranch;
    const matchesSem = activeSem === null || subject.semester === activeSem;
    return matchesBranch && matchesSem;
  });

  function cycleSemester() {
    if (semesters.length <= 1) return;
    setSelectedSem((prev) => {
      if (prev === null) return semesters[0];
      const index = semesters.indexOf(prev);
      if (index === -1 || index + 1 >= semesters.length) return null;
      return semesters[index + 1];
    });
  }

  return (
    <section aria-label="GTU Subjects" className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex flex-wrap rounded-xl bg-slate-200/70 p-1"
          role="group"
          aria-label="Filter by branch"
        >
          {branchOptions.map((branch) => {
            const isActive = activeBranch === branch;
            return (
              <button
                key={branch}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedBranch(branch)}
                className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs transition cursor-pointer ${
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

        {semesters.length > 1 && (
          <button
            type="button"
            aria-pressed={activeSem !== null}
            onClick={cycleSemester}
            className={`min-h-[44px] rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold transition cursor-pointer ${
              activeSem !== null
                ? "border-slate-200 bg-white text-slate-700 shadow-2xs"
                : "border-slate-200/70 bg-slate-100/70 text-slate-500 hover:text-slate-700"
            }`}
          >
            {activeSem === null ? "All Sems" : `Sem ${activeSem}`}
          </button>
        )}
      </div>

      <div className="mt-3.5 space-y-3">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.code}
              subject={subject}
              todayISO={todayISO}
            />
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
              Reset filters to see all available GTU subjects.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBranch("All");
                setSelectedSem(null);
              }}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
