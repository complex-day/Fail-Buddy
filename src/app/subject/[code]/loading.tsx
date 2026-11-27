export default function SubjectLoading() {
  return (
    <div
      className="min-h-dvh bg-pixel-canvas text-slate-900"
      aria-busy="true"
      aria-label="Loading subject study kit"
    >
      <main className="max-w-md mx-auto px-4 pt-4 pb-12">
        {/* Compact Top Bar Skeleton */}
        <header className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 bg-white/80 animate-pulse" />
            <div className="min-w-0">
              <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="mt-1.5 h-3 w-16 rounded bg-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="h-5 w-16 shrink-0 rounded-full bg-slate-200/90 animate-pulse" />
        </header>

        {/* Optical Lens Topper Strip Skeleton */}
        <section
          aria-hidden="true"
          className="mt-3 relative overflow-hidden rounded-2xl"
        >
          <div className="absolute -inset-4 lens-orb" />
          <div className="relative rounded-2xl lens-glass px-3.5 py-2.5 flex items-center gap-2">
            <div className="h-4 w-4 shrink-0 rounded-full bg-indigo-200/80 animate-pulse" />
            <div className="h-3.5 w-3/4 rounded bg-slate-200/80 animate-pulse" />
          </div>
        </section>

        {/* 2-Tab Switcher Skeleton */}
        <div
          aria-hidden="true"
          className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1"
        >
          <div className="h-7 rounded-lg bg-white/90 animate-pulse" />
          <div className="h-7 rounded-lg bg-slate-200/60 animate-pulse" />
        </div>

        {/* Must-Do Filter Row Skeleton */}
        <div
          aria-hidden="true"
          className="mt-4 flex items-center justify-between gap-2"
        >
          <div className="h-7 w-40 rounded-full bg-slate-200/80 animate-pulse" />
          <div className="h-3.5 w-14 rounded bg-slate-200/80 animate-pulse" />
        </div>

        {/* 3 IMP Accordion Skeletons */}
        <div aria-hidden="true" className="mt-3 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="card-elevated rounded-2xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-5 w-24 rounded-full bg-slate-200/80" />
              </div>

              <div className="mt-2.5 space-y-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-4/5 rounded bg-slate-200/80" />
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="h-3 w-32 rounded bg-slate-200/80" />
                <div className="h-4 w-4 rounded bg-slate-200/70" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
