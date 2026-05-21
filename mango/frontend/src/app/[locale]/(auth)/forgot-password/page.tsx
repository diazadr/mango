import { getTranslations } from "next-intl/server";
import { ForgotPasswordView } from "@/src/features/auth/views/ForgotPasswordView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ForgotPasswordPage" });
  return {
    title: t("title"),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
