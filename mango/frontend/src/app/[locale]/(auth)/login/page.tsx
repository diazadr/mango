import { getTranslations } from "next-intl/server";
import { LoginView } from "@/src/features/auth/views/LoginView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LoginPage" });
  return {
    title: t("title"),
  };
}

export default function LoginPage() {
  return <LoginView />;
}
