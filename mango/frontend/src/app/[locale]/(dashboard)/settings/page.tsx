import { SettingsView } from "@/src/features/settings/views/SettingsView";


import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SettingsPage" });
  return {
    title: t("page_title"),
  };
}

export default function SettingsPage() {
  return <SettingsView />;
}
