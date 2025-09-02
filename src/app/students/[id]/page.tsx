// app/students/[id]/page.tsx
import StudentDetailClient from "./StudentDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ u Next 15 params je Promise – moraš ga awaitati
  const { id } = await params;

  return <StudentDetailClient id={id} />;
}
