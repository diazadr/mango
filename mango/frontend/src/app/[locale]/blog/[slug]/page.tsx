import { PublicArticleDetailView } from "@/src/features/articles/views/PublicArticleDetailView";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ArticleDetail" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug, locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  return <PublicArticleDetailView slug={slug} />;
}
