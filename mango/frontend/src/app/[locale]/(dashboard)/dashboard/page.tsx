import { MainDashboardView } from "@/src/features/dashboard/views/MainDashboardView";


import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DashboardPage" });
  return {
    title: t("page_title"),
  };
}

export default function DashboardPage() {
  return <MainDashboardView />;
}
