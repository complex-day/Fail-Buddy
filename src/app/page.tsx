import { BadgeCheck, MessageCircleHeart } from "lucide-react";
import HomeSubjectExplorer from "@/components/HomeSubjectExplorer";
import { getSubjects } from "@/lib/data";
import { getTodayUTCISO } from "@/lib/date";

export const dynamic = "force-dynamic";

const DEFAULT_SITE_URL = "https://fail-buddy.vercel.app";

function PixelShieldFlameIcon() {
  return (
    <svg
      viewBox="0 0 8 8"
      className="h-full w-full"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Crisp 8x8 pixel-mosaic shield frame */}
      <rect x="1" y="0" width="6" height="1" fill="#E2E8F0" />
      <rect x="0" y="1" width="1" height="4" fill="#E2E8F0" />
      <rect x="7" y="1" width="1" height="4" fill="#E2E8F0" />
      <rect x="1" y="5" width="1" height="1" fill="#E2E8F0" />
      <rect x="6" y="5" width="1" height="1" fill="#E2E8F0" />
      <rect x="2" y="6" width="1" height="1" fill="#CBD5E1" />
      <rect x="5" y="6" width="1" height="1" fill="#CBD5E1" />
      <rect x="3" y="7" width="2" height="1" fill="#94A3B8" />
      {/* Inner emerald pixel flame */}
      <rect x="4" y="1" width="1" height="1" fill="#6EE7B7" />
      <rect x="3" y="2" width="2" height="1" fill="#34D399" />
      <rect x="2" y="3" width="4" height="2" fill="#10B981" />
      <rect x="3" y="4" width="2" height="1" fill="#ECFDF5" />
      <rect x="3" y="5" width="2" height="2" fill="#059669" />
    </svg>
  );
}

export default async function HomePage() {
  const subjects = await getSubjects();
  const todayISO = getTodayUTCISO();
  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim() ||
    DEFAULT_SITE_URL;
  const shareText = `GTU External 23/70 Passing Kit! Get high-frequency PYQs & syllabus-mapped IMPs with zero login on Fail Buddy: ${siteUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-dvh bg-pixel-canvas text-slate-900">
      <main className="max-w-md mx-auto px-4 pt-5 pb-28">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-900 p-1.5 shadow-xs">
              <PixelShieldFlameIcon />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                Fail Buddy
              </h1>
              <p className="text-xs font-medium text-slate-500">
                GTU External · 23/70 Passing Kit
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Zero Login
          </span>
        </header>

        <section
          aria-label="Verification trust strip"
          className="mt-4 relative overflow-hidden rounded-2xl"
        >
          <div aria-hidden="true" className="absolute -inset-4 lens-orb" />
          <div className="relative rounded-2xl lens-glass px-3.5 py-3 flex items-center gap-2.5">
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-indigo-600"
              aria-hidden="true"
            />
            <p className="text-[13px] leading-snug font-medium text-slate-700">
              GTU External Exam Prep — High-Frequency PYQs &amp; Syllabus-Mapped
              Passing Kit
            </p>
          </div>
        </section>

        <HomeSubjectExplorer subjects={subjects} todayISO={todayISO} />
      </main>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-20 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900/95 backdrop-blur-md px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.45)] ring-1 ring-white/10 active:scale-[0.98] transition"
          >
            <MessageCircleHeart
              className="h-4 w-4 text-emerald-400"
              aria-hidden="true"
            />
            Share Fail Buddy on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
