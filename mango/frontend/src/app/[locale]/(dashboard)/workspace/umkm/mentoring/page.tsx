import { getTranslations } from "next-intl/server";
import { MentoringView } from "@/src/features/mentoring/views/MentoringView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmMentoringPage" });
  return {
    title: t("title"),
  };
}

export default function MentoringPage() {
  return <MentoringView />;
}
