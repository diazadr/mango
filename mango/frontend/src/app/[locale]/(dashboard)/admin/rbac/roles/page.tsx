import { getTranslations } from "next-intl/server";
import { RolesView } from "@/src/features/admin-rbac/views/RolesView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminRbacRolesPage" });
  return {
    title: t("title"),
  };
}

export default function RolesPage() {
  return <RolesView />;
}
