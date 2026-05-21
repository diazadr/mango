import { getTranslations } from "next-intl/server";
import { AdvisorMentoringDetailView } from "@/src/features/mentoring/views/AdvisorMentoringDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceAdvisorMentoringPage" });
  return {
    title: t("title"),
  };
}

export default function AdvisorMentoringDetailPage() {
  return <AdvisorMentoringDetailView />;
}
