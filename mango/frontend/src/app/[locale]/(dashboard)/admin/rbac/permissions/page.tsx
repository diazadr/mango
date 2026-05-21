import { getTranslations } from "next-intl/server";
import { PermissionsView } from "@/src/features/admin-rbac/views/PermissionsView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminRbacPermissionsPage" });
  return {
    title: t("title"),
  };
}

export default function PermissionsPage() {
  return <PermissionsView />;
}
