// app/tests/[id]/page.tsx
import type { Metadata } from "next";
import TestDetailClient from "./TestDetailClient";
import { RequireProfessor } from "@/components/guards";

type Params = { params: { id: string } };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Test details" };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TestDetailPage({ params }: Params) {
  return (
    <RequireProfessor>
      <TestDetailClient id={params.id} />
    </RequireProfessor>
  );
}
