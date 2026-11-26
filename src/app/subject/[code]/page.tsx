import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import SubjectHub from "@/components/SubjectHub";
import { MOCK_MATERIALS, MOCK_SUBJECTS } from "@/data/mockData";

interface SubjectPageProps {
  params: Promise<{ code: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { code } = await params;

  const subject = MOCK_SUBJECTS.find((item) => item.code === code);
  const materials = MOCK_MATERIALS.filter(
    (item) => item.subject_code === code
  );

  if (!subject) {
    return (
      <div className="min-h-dvh bg-pixel-canvas text-slate-900">
        <main className="max-w-md mx-auto px-4 py-12">
          <div className="card-elevated rounded-2xl p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              Subject Not Found
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              We couldn&apos;t find a Zero Fail kit for GTU code{" "}
              <span className="font-mono font-semibold text-slate-800">
                {code}
              </span>
              .
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Subjects
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <SubjectHub subject={subject} materials={materials} />;
}
