import { getTranslations } from "next-intl/server";
import { LivingLabDashboardView } from "@/src/features/living-lab/views/LivingLabDashboardView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return {
    title: "Beranda Living Lab — MANGO Admin",
  };
}

export default function LivingLabAdminPage() {
  return <LivingLabDashboardView />;
}
