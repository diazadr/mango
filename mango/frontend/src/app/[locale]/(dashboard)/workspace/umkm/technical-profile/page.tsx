import { getTranslations } from "next-intl/server";
import { TechnicalProfileView } from "@/src/features/umkm-profile/views/TechnicalProfileView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmTechnicalProfilePage" });
  return {
    title: t("title"),
  };
}

export default function TechnicalProfilePage() {
  return <TechnicalProfileView />;
}
