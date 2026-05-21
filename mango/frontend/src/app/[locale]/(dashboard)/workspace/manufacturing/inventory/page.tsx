import { getTranslations } from "next-intl/server";
import { InventoryView } from "@/src/features/manufacturing/views/InventoryView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceManufacturingInventoryPage" });
  return {
    title: t("title"),
  };
}

export default function InventoryPage() {
  return <InventoryView />;
}
