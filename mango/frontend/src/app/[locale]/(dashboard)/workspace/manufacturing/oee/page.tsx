import { OEEDashboardView } from "@/src/features/manufacturing/views/OEEDashboardView";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ManufacturingOEE" });
    return {
        title: t("oee_title"),
        description: t("oee_subtitle"),
    };
}

export default function OEEPage() {
    return <OEEDashboardView />;
}
