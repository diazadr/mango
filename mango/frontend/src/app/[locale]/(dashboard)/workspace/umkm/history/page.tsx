import { getTranslations } from "next-intl/server";
import { UmkmProgressHistoryView } from "@/src/features/umkm-progress/views/UmkmProgressHistoryView";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmHistoryPage" });
  return {
    title: t("title"),
  };
}

export default function UmkmHistoryPage() {
  return (
    <DashboardPageShell>
      <UmkmProgressHistoryView />
    </DashboardPageShell>
  );
}
