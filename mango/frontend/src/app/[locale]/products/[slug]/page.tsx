import { PublicProductDetailView } from "@/src/features/landing/views/PublicProductDetailView";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductDetail" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <PublicProductDetailView slug={resolvedParams.slug} />;
}
