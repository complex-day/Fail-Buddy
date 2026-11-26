export default function HomeLoading() {
  return (
    <div
      className="min-h-dvh bg-pixel-canvas text-slate-900"
      aria-busy="true"
      aria-label="Loading subjects"
    >
      <main className="max-w-md mx-auto px-4 pt-5 pb-28">
        {/* Top Header Bar Skeleton */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200 animate-pulse" />
            <div>
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="mt-1.5 h-3 w-28 rounded bg-slate-200/80 animate-pulse" />
            </div>
          </div>

          <div className="h-6 w-20 shrink-0 rounded-full bg-slate-200/90 animate-pulse" />
        </header>

        {/* Optical Lens Trust Strip Skeleton */}
        <section
          aria-hidden="true"
          className="mt-4 relative overflow-hidden rounded-2xl"
        >
          <div className="absolute -inset-4 lens-orb" />
          <div className="relative rounded-2xl lens-glass px-3.5 py-3 flex items-center gap-2.5">
            <div className="h-4 w-4 shrink-0 rounded-full bg-indigo-200/80 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-full rounded bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-slate-200/70 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Filter Row Skeleton */}
        <div
          aria-hidden="true"
          className="mt-5 flex items-center justify-between gap-2"
        >
          <div className="h-8 w-36 rounded-xl bg-slate-200/75 animate-pulse" />
          <div className="h-8 w-20 rounded-xl bg-slate-200/75 animate-pulse" />
        </div>

        {/* 3 Subject Card Skeletons */}
        <div aria-hidden="true" className="mt-3.5 space-y-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="card-elevated rounded-2xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-5 w-16 rounded-full bg-slate-200/80" />
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="h-4 w-4 rounded bg-slate-200/70" />
              </div>

              <div className="mt-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-3 w-20 rounded bg-slate-200/80" />
                  <div className="h-3 w-16 rounded bg-slate-200/80" />
                </div>
                <div className="mt-1.5 grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_, blockIndex) => (
                    <span
                      key={blockIndex}
                      className="h-1.5 rounded-[2px] bg-slate-200/80"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="h-3 w-36 rounded bg-slate-200/80" />
                <div className="h-3 w-16 rounded bg-slate-200/80" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
