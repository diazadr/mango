import { getTranslations } from "next-intl/server";
import { AssessmentView } from "@/src/features/umkm-assessment/views/AssessmentView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmAssessmentPage" });
  return {
    title: t("title"),
  };
}

export default function AssessmentPage() {
  return <AssessmentView />;
}
