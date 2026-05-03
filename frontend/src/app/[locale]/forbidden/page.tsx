"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter">Akses Terbatas</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Maaf, Anda tidak memiliki izin yang cukup untuk mengakses halaman ini. 
        Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
      </p>
      <Button 
        onClick={() => router.push("/dashboard")}
        className="h-14 px-8 font-bold gap-2 shadow-xl shadow-primary/20"
      >
        <ArrowLeft size={20} />
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
