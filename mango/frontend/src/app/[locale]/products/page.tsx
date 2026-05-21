import { PublicProductCatalogView } from "@/src/features/landing/views/PublicProductCatalogView";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PublicProductsPage" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default function ProductsPage() {
  return <PublicProductCatalogView />;
}
