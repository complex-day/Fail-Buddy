import { Sparkles } from "lucide-react";

interface TopperTipCardProps {
  tip: string | null;
}

/** Displays a highlighted topper exam tip beneath a question or assignment answer. */
export default function TopperTipCard({ tip }: TopperTipCardProps) {
  if (!tip) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-3 text-indigo-800">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-900">
        <Sparkles
          className="h-4 w-4 shrink-0 text-indigo-600"
          aria-hidden="true"
        />
        <span>Topper Exam Tip</span>
      </div>
      <p className="mt-1.5 text-base leading-relaxed break-words">{tip}</p>
    </div>
  );
}
