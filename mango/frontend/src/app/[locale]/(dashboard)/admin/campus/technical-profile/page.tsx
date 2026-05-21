import { getTranslations } from "next-intl/server";
import { AdminCampusTechnicalProfileView } from "@/src/features/admin-campus/views/AdminCampusTechnicalProfileView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminCampusTechnicalProfilePage" });
  return {
    title: t("title"),
  };
}

export default function CampusTechnicalProfilePage() {
  return <AdminCampusTechnicalProfileView />;
}
