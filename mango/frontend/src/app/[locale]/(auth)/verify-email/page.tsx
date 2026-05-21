import { getTranslations } from "next-intl/server";
import { VerifyEmailView } from "@/src/features/auth/views/VerifyEmailView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "VerifyEmailPage" });
  return {
    title: t("title"),
  };
}

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
