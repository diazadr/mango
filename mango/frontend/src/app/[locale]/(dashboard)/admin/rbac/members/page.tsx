import { getTranslations } from "next-intl/server";
import { RbacView } from "@/src/features/admin-rbac/views/RbacView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminRbacMembersPage" });
  return {
    title: t("title"),
  };
}

export default function MembersPage() {
  return <RbacView />;
}
