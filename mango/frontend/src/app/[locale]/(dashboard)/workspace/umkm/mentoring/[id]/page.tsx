import { getTranslations } from "next-intl/server";
import { MentoringDetailView } from "@/src/features/mentoring/views/MentoringDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmMentoringPage" });
  return {
    title: t("title"),
  };
}

export default function MentoringDetailPage() {
  return <MentoringDetailView />;
}
