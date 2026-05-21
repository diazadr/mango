import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WorkspaceUmkmPage" });
  return {
    title: t("title"),
  };
}

export default function UmkmPage() {
    redirect("/dashboard");
}
