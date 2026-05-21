import { UmkmProfileView } from "@/src/features/umkm-profile/views/UmkmProfileView";


import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "UmkmProfilePage" });
  return {
    title: t("title"),
  };
}

export default function UmkmProfilePage() {
  return <UmkmProfileView />;
}
