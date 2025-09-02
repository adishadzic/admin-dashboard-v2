import AttemptClient from "./AttemptClient";

export default function AttemptPage({ params }: { params: { id: string } }) {
  return <AttemptClient id={params.id} />;
}
