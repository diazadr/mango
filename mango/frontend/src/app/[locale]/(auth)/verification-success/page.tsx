import { getTranslations } from "next-intl/server";
import { VerificationSuccessView } from "@/src/features/auth/views/VerificationSuccessView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VerificationSuccessPage" });
  return {
    title: t("title"),
  };
}

export default function VerificationSuccessPage() {
  return <VerificationSuccessView />;
}
