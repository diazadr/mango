import { getTranslations } from "next-intl/server";
import { AssessmentResultView } from "@/src/features/umkm-assessment/views/AssessmentResultView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmAssessmentResultPage" });
  return {
    title: t("title"),
  };
}

export default function ResultPage() {
  return <AssessmentResultView />;
}
