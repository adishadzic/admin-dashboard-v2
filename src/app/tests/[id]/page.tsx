import type { Metadata } from "next";
import TestDetailClient from "./TestDetailClient";
import { RequireProfessor } from "@/components/guards";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Test details" };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireProfessor>
      <TestDetailClient id={id} />
    </RequireProfessor>
  );
}
