import { getTranslations } from "next-intl/server";
import { ReservationsView } from "@/src/features/manufacturing/views/ReservationsView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceReservationsPage" });
  return {
    title: t("title"),
  };
}

export default function MachineReservationPage() {
  return <ReservationsView />;
}
