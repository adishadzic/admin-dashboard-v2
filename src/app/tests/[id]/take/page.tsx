import RequireStudent from "@/components/auth/RequireStudent";
import TakeTestClient from "./TakeTestClient";

export default function TakePage({ params }: { params: { id: string } }) {
  return (
    <RequireStudent>
      <TakeTestClient id={params.id} />
    </RequireStudent>
  );
}
