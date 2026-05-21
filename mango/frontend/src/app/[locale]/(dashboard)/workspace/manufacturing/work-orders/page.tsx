import { getTranslations } from "next-intl/server";
import { WorkOrdersView } from "@/src/features/manufacturing/views/WorkOrdersView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DashboardSidebar.menu" });
  return {
    title: t("work_orders"),
  };
}

export default function WorkOrdersPage() {
  return <WorkOrdersView />;
}
