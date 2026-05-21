import { getTranslations } from "next-intl/server";
import { ProductsView } from "@/src/features/manufacturing/views/ProductsView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceManufacturingProductsPage" });
  return {
    title: t("title"),
  };
}

export default function ProductsPage() {
  return <ProductsView />;
}
