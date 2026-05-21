import { getTranslations } from "next-intl/server";
import { ReservationHistoryView } from "@/src/features/manufacturing/views/ReservationHistoryView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsHistoryPage" });
  return {
    title: t("title"),
  };
}

export default function ReservationHistoryPage() {
  return <ReservationHistoryView />;
}
