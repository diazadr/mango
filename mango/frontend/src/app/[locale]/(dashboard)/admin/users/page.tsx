import { getTranslations } from "next-intl/server";
import { UserAdminView } from "@/src/features/admin-users/views/UserAdminView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminUsersPage" });
  return {
    title: t("title"),
  };
}

export default function UserManagementPage() {
  return <UserAdminView />;
}
