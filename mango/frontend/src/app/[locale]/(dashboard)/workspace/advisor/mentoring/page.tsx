import { getTranslations } from "next-intl/server";
import { AdvisorMentoringListView } from "@/src/features/mentoring/views/AdvisorMentoringListView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceAdvisorMentoringPage" });
  return {
    title: t("title"),
  };
}

export default function AdvisorMentoringPage() {
  return <AdvisorMentoringListView />;
}
