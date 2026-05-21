import { getTranslations } from "next-intl/server";
import { AlarmEventsView } from "@/src/features/manufacturing/views/AlarmEventsView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DashboardSidebar.menu" });
  return {
    title: t("alarm_events"),
  };
}

export default function AlarmEventsPage() {
  return <AlarmEventsView />;
}
