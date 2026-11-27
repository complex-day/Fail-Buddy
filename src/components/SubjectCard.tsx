import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCountdownBadge } from "@/lib/date";
import type { Subject } from "@/lib/supabase";

interface SubjectCardProps {
  subject: Subject;
  todayISO?: string;
}

const TOTAL_METER_BLOCKS = 10;
// 23/70 external passing target (~33%) represented cleanly on a 10-block meter
const FILLED_METER_BLOCKS = 3;

export default function SubjectCard({ subject, todayISO }: SubjectCardProps) {
  const countdown = formatCountdownBadge(subject.exam_date, todayISO);

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
            External Passing Target
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

      {/* Row 4: Honest exam pattern metadata + CTA */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">
          GTU External · 70 Marks
        </span>
        <span className="font-semibold text-emerald-700">
          Open Passing Kit
        </span>
      </div>
    </Link>
  );
}
