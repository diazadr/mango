import { getTranslations } from "next-intl/server";
import { ReservationApprovalDetailView } from "@/src/features/manufacturing/views/ReservationApprovalDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsApprovalsPage" });
  return {
    title: t("title"),
  };
}

export default function TransactionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <ReservationApprovalDetailView params={params} />;
}
