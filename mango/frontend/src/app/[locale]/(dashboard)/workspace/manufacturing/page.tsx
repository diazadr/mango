import { getTranslations } from "next-intl/server";
import { ManufacturingSummaryView } from "@/src/features/manufacturing/views/ManufacturingSummaryView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DashboardSidebar.menu" });
  return {
    title: t("erp_overview"),
  };
}

export default function ManufacturingPage() {
  return <ManufacturingSummaryView />;
}
