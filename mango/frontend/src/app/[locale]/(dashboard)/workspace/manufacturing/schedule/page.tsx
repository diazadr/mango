import { ScheduleView } from "@/src/features/manufacturing/views/ScheduleView";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ManufacturingSchedule" });
  return {
    title: t("schedule_title"),
    description: t("schedule_subtitle"),
  };
}

export default function ManufacturingSchedulePage() {
  return <ScheduleView />;
}
