import RequireStudent from "@/components/auth/RequireStudent";
import TakeTestClient from "./TakeTestClient";

export default async function TakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireStudent>
      <TakeTestClient id={id} />
    </RequireStudent>
  );
}
