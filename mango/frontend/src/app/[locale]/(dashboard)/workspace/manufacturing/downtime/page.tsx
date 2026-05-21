import { getTranslations } from "next-intl/server";
import { DowntimeView } from "@/src/features/manufacturing/views/DowntimeView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceManufacturingDowntimePage" });
  return {
    title: t("title"),
  };
}

export default function DowntimePage() {
  return <DowntimeView />;
}
