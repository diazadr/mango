import { getTranslations } from "next-intl/server";
import { UmkmAdminView } from "@/src/features/admin-umkm/views/UmkmAdminView";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminUptUmkmPage" });
  return {
    title: t("title"),
  };
}

export default function UptUmkmPage() {
  return (
    <UmkmAdminView 
      title="Registry IKM/UMKM" 
      subtitle="Daftar unit usaha binaan yang terdaftar di bawah unit pengelola Anda." 
    />
  );
}
