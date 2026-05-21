import { getTranslations } from "next-intl/server";
import { InvoiceDetailView } from "@/src/features/invoice/views/InvoiceDetailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "InvoicePage" });
  return {
    title: t("title"),
  };
}

export default function InvoicePage() {
  return <InvoiceDetailView />;
}
