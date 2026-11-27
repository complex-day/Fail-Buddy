import { Lightbulb } from "lucide-react";
import FormattedContent from "@/components/FormattedContent";

interface TopperTipCardProps {
  tip: string | null;
}

/** Displays highlighted topper note and guidance beneath an IMP answer. */
export default function TopperTipCard({ tip }: TopperTipCardProps) {
  if (!tip) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-3 text-indigo-900">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
        <Lightbulb
          className="h-4 w-4 shrink-0 text-indigo-600"
          aria-hidden="true"
        />
        <span>Topper Note &amp; Guidance</span>
      </div>
      <div className="mt-1.5">
        <FormattedContent content={tip} variant="compact" />
      </div>
    </div>
  );
}
