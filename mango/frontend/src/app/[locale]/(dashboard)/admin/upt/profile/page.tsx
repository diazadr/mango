import { getTranslations } from "next-intl/server";

import { UptInfoView } from "@/src/features/admin-org/views/UptInfoView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminUptProfilePage" });
  return {
    title: t("title"),
  };
}

export default function UptProfilePage() {
    return (
        <UptInfoView
            pageTitle="Profil Unit Pengelola"
            pageSubtitle="Kelola identitas resmi Unit Pengelola (UPT) dalam ekosistem MANGO."
        />
    );
}
