import { PublicArticleDetailPageView } from "@/src/features/articles/views/PublicArticleDetailPageView";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicArticleDetailPageView slug={slug} />;
}
