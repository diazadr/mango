"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function VerificationSuccessView() {
  const router = useRouter();
  const t = useTranslations("VerificationSuccessPage");

  return (
    <main className="min-h-screen w-full flex bg-background font-sans text-foreground">
      {/* Hero Section (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary">
        <Image 
          src="/images/login-hero.jpg"
          alt="Verification Success" 
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold font-heading mb-4">
            Email <span className="text-accent">Terverifikasi</span>
          </h2>
          <p className="text-lg text-white/90">
            Selamat! Akun Anda kini telah aktif dan siap digunakan dalam ekosistem MANGO.
          </p>
        </div>
      </div>

      {/* Content Section (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background relative">
        <div className="w-full max-w-md text-center lg:text-left">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="h-20 w-20 rounded-3xl bg-success/10 text-success flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-sm border border-success/10"
          >
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-10 text-lg">
            {t("description")}
          </p>

          <Button
            onClick={() => router.push("/onboarding")}
            className="h-14 w-full rounded-2xl bg-primary text-base font-black text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
          >
            <span>{t("continue_button")}</span>
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                Konfirmasi Keamanan MANGO v2.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
