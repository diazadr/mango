import { getTranslations } from "next-intl/server";
import { ReservationDetailView } from "@/src/features/manufacturing/views/ReservationDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsPage" });
  return {
    title: t("title"),
  };
}

export default function ReservationDetailPage({
    params,
}: {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}) {
    return <ReservationDetailView params={params} />;
}
