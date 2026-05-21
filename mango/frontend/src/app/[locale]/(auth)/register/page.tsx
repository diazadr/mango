import { getTranslations } from "next-intl/server";
import { RegisterView } from "@/src/features/auth/views/RegisterView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RegisterPage" });
  return {
    title: t("title"),
  };
}

export default function RegisterPage() {
  return <RegisterView />;
}
