import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ForbiddenPage" });
  return {
    title: t("title"),
  };
}

export default function ForbiddenPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-4xl font-black text-foreground mb-2 tracking-tighter">Akses Terbatas</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Maaf, Anda tidak memiliki izin yang cukup untuk mengakses halaman ini. 
        Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
      </p>
      <Link href="/dashboard">
        <Button className="h-14 px-8 font-bold gap-2 shadow-xl shadow-primary/20">
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
}

