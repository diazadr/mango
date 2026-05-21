import { getTranslations } from "next-intl/server";
import { CampusInfoView } from "@/src/features/admin-campus/views/CampusInfoView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminCampusInfoPage" });
  return {
    title: t("title"),
  };
}

export default function CampusInfoPage() {
  return <CampusInfoView />;
}
