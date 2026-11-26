import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type { Subject } from "@/lib/supabase";

interface SubjectCardProps {
  subject: Subject;
}

const TOTAL_METER_BLOCKS = 10;
const FILLED_METER_BLOCKS = 4;

function getDaysRemaining(examDate: string): { label: string; urgent: boolean } {
  const [year, month, day] = examDate.split("-").map(Number);
  if (!year || !month || !day) {
    return { label: "Soon", urgent: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exam = new Date(year, month - 1, day);
  const diffDays = Math.round(
    (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return { label: "Done", urgent: false };
  }
  if (diffDays === 0) {
    return { label: "Today", urgent: true };
  }
  return { label: `${diffDays}d left`, urgent: diffDays <= 7 };
}

function getStudyingCount(subject: Subject): number {
  const codeTail = Number(subject.code.slice(-2)) || 10;
  return 24 + subject.unlocked_by.length * 11 + (codeTail % 9);
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const countdown = getDaysRemaining(subject.exam_date);
  const studyingCount = getStudyingCount(subject);

  return (
    <Link
      href={`/subject/${subject.code}`}
      className="card-elevated rounded-2xl p-4 block group transition hover:border-slate-300 active:scale-[0.99]"
    >
      {/* Row 1: GTU code + branch/sem + countdown pill */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-xs font-semibold text-slate-500">
            {subject.code}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs font-medium text-slate-500 truncate">
            {subject.branch} · Sem {subject.semester}
          </span>
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
      </div>

      {/* Row 2: Subject name + chevron */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-bold tracking-tight text-slate-900 leading-snug">
          {subject.name}
        </h2>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 transition"
          aria-hidden="true"
        />
      </div>

      {/* Row 3: Inline pixel-mosaic passing meter */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">
            Passing Kit
          </span>
          <span className="font-mono text-[11px] font-semibold text-emerald-700">
            {subject.passing_target}
          </span>
        </div>

        <div className="mt-1.5 grid grid-cols-10 gap-1" aria-hidden="true">
          {Array.from({ length: TOTAL_METER_BLOCKS }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-[2px] ${
                index < FILLED_METER_BLOCKS
                  ? "bg-emerald-500"
                  : "bg-slate-200/90"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Row 4: Topper verification + active students */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck
            className="h-3.5 w-3.5 shrink-0 text-indigo-600"
            aria-hidden="true"
          />
          <span className="truncate text-slate-600 font-medium">
            Verified by {subject.topper_name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-medium">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>{studyingCount} active</span>
        </div>
      </div>
    </Link>
  );
}
