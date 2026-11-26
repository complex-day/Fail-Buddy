import { notFound } from "next/navigation";
import SubjectHub from "@/components/SubjectHub";
import { getSubjectWithMaterials } from "@/lib/data";
import { getTodayUTCISO } from "@/lib/date";

export const dynamic = "force-dynamic";

interface SubjectPageProps {
  params: Promise<{ code: string }>;
}

function normalizeRouteCode(rawCode: string): string {
  try {
    return decodeURIComponent(rawCode).trim();
  } catch {
    return rawCode.trim();
  }
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { code } = await params;
  const normalizedCode = normalizeRouteCode(code);

  if (!normalizedCode) {
    notFound();
  }

  const { subject, materials } = await getSubjectWithMaterials(normalizedCode);

  if (!subject) {
    notFound();
  }

  const todayISO = getTodayUTCISO();

  return (
    <SubjectHub subject={subject} materials={materials} todayISO={todayISO} />
  );
}
