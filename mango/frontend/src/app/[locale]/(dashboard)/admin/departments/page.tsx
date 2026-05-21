import { getTranslations } from "next-intl/server";
import { DepartmentView } from "@/src/features/admin-campus/views/DepartmentView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminDepartmentsPage" });
  return {
    title: t("title"),
  };
}

export default function DepartmentsPage() {
  return <DepartmentView />;
}
