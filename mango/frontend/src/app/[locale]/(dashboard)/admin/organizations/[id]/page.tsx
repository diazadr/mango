import { OrgDetailView } from "@/src/features/admin-org/views/OrgDetailView";

export async function generateMetadata() {
  return { title: "Detail Organisasi — MANGO" };
}

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrgDetailView orgId={id} />;
}
