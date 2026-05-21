import { PublicArticleListView } from "@/src/features/articles/views/PublicArticleListView";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PublicBlogPage" });
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <PublicArticleListView />;
}
