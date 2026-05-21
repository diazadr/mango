import { getTranslations } from "next-intl/server";
import { ProductionRecordsView } from "@/src/features/manufacturing/views/ProductionRecordsView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DashboardSidebar.menu" });
  return {
    title: t("production_records"),
  };
}

export default function ProductionRecordsPage() {
  return <ProductionRecordsView />;
}
