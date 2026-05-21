import { getTranslations } from "next-intl/server";

import { ProjectsView } from "@/src/features/mentoring/views/ProjectsView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmProjectsPage" });
  return {
    title: t("title"),
  };
}

export default function Page() {
    return <ProjectsView type="umkm" />;
}
