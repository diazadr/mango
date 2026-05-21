import { getTranslations } from "next-intl/server";
import { DocumentUmkmView } from "@/src/features/documents/views/DocumentUmkmView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocumentUmkmPage" });
  return {
    title: t("title"),
  };
}

export default function UmkmResumeDocument() {
  return <DocumentUmkmView />;
}
