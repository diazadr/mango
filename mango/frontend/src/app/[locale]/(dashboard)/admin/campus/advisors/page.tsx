import { getTranslations } from "next-intl/server";
import { AdvisorView } from "@/src/features/admin-campus/views/AdvisorView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminCampusAdvisorsPage" });
  return {
    title: t("title"),
  };
}

export default function AdvisorManagementPage() {
  return <AdvisorView />;
}
