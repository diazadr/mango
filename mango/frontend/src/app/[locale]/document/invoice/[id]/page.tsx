import { getTranslations } from "next-intl/server";
import { DocumentInvoiceView } from "@/src/features/documents/views/DocumentInvoiceView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocumentInvoicePage" });
  return {
    title: t("title"),
  };
}

export default function InvoiceDocumentPage() {
  return <DocumentInvoiceView />;
}
