import { getTranslations } from "next-intl/server";
import { ProjectDetailView } from "@/src/features/mentoring/views/ProjectDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmProjectsPage" });
  return {
    title: t("title"),
  };
}

export default function ProjectDetailPage() {
  return <ProjectDetailView />;
}
