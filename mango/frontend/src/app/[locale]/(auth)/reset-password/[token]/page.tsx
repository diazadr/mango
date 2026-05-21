import { getTranslations } from "next-intl/server";
import { ResetPasswordView } from "@/src/features/auth/views/ResetPasswordView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string, token: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ResetPasswordPage" });
  return {
    title: t("title"),
  };
}

export default function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email: string }>;
}) {
  return (
    <ResetPasswordWrapper params={params} searchParams={searchParams} />
  );
}

async function ResetPasswordWrapper({
    params,
    searchParams,
  }: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ email: string }>;
  }) {
    const { token } = await params;
    const { email } = await searchParams;
    
    return <ResetPasswordView token={token} email={email} />;
  }
