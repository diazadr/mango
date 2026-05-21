import { getTranslations } from "next-intl/server";
import { MachinesView } from "@/src/features/manufacturing/views/MachinesView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceMachinesPage" });
  return {
    title: t("title"),
  };
}

export default function MachineCatalogPage() {
  return <MachinesView />;
}
