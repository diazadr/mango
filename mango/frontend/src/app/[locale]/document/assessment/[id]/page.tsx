import { getTranslations } from "next-intl/server";
import { DocumentAssessmentView } from "@/src/features/documents/views/DocumentAssessmentView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocumentAssessmentPage" });
  return {
    title: t("title"),
  };
}

export default function AssessmentDocumentPage() {
  return <DocumentAssessmentView />;
}
