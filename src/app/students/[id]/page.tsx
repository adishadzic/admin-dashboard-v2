import StudentDetailClient from "./StudentDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentDetailClient id={id} />;
}
