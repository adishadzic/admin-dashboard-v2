import AttemptClient from "./AttemptClient";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AttemptClient id={id} />;
}
