import { getTranslations } from "next-intl/server";

import ProjectDetailPage from "../../../umkm/projects/[id]/page";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceAdvisorProjectsPage" });
  return {
    title: t("title"),
  };
}

export default function AdvisorProjectDetailPage() {
    return <ProjectDetailPage />;
}
