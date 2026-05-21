import { EdgeSiteManagementView } from "@/src/features/manufacturing/views/EdgeSiteManagementView";

import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ManufacturingPage" });
    return {
        title: t("edge_sites_title"),
        description: t("edge_sites_subtitle"),
    };
}

export default function EdgeSitesPage() {
    return <EdgeSiteManagementView />;
}
