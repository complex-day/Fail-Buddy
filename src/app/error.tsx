"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[FailBuddy ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-pixel-canvas text-slate-900">
      <main className="max-w-md mx-auto px-4 py-12">
        <section className="card-elevated rounded-2xl p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-600">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">
            Something went wrong while loading Fail Buddy
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 leading-snug">
            A quick hiccup occurred while loading your study kit. Tap below to
            retry or head back to all GTU subjects.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98] transition"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
