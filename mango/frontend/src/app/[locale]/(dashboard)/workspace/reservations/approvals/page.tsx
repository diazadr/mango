import { getTranslations } from "next-intl/server";
import { ReservationApprovalsView } from "@/src/features/manufacturing/views/ReservationApprovalsView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsApprovalsPage" });
  return {
    title: t("title"),
  };
}

export default function MachineApprovalPage() {
  return <ReservationApprovalsView />;
}
