import { getTranslations } from "next-intl/server";
import { ReservationHistoryDetailView } from "@/src/features/manufacturing/views/ReservationHistoryDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsHistoryPage" });
  return {
    title: t("title"),
  };
}

export default function ReservationHistoryDetailPage({
    params,
}: {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}) {
    return <ReservationHistoryDetailView params={params} />;
}
