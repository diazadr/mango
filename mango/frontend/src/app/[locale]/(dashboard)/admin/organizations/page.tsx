import { getTranslations } from "next-intl/server";
// Server Component Wrapper

import { UmkmOrganizationView } from "@/src/features/admin-org/views/UmkmOrganizationView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminOrganizationsPage" });
  return {
    title: t("title"),
  };
}

export default function OrganizationPage() {
  return <UmkmOrganizationView />;
}
