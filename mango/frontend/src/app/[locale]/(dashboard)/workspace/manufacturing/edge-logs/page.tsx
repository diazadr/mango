import { getTranslations } from "next-intl/server";
// [NOTE.MD #5] Halaman Edge MES Logs dihapus — redirect ke Edge Sites
import { redirect } from "next/navigation";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceManufacturingEdgeLogsPage" });
  return {
    title: t("title"),
  };
}

export default function EdgeLogsPage() {
    redirect("/workspace/manufacturing/edge-sites");
}
