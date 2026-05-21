import { getTranslations } from "next-intl/server";
import { RbacUsersView } from "@/src/features/admin-rbac/views/RbacUsersView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminRbacPage" });
  return {
    title: t("title"),
  };
}

export default function RBACPage() {
  return <RbacUsersView />;
}
