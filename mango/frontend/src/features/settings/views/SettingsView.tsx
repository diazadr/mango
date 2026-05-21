"use client";

import React from "react";
import { Globe, Monitor } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { LocaleSwitcher } from "@/src/features/profile/components/LocaleSwitcher";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export function SettingsView() {
  const t = useTranslations("ProfilePage");

  return (
    <DashboardPageShell 
        title={t("title_pengaturan_sistem")} 
        subtitle={t("title_kelola_preferensi_bahasa_untuk_akun_anda")}
    >
      <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <SectionCard title={t("language_preference")} icon={Globe} className="rounded-xl shadow-sm border-border/50">
                <div className="py-2">
                    <p className="text-xs text-muted-foreground mb-8 leading-relaxed text-left">
                        {t("select_language")}
                    </p>
                    <LocaleSwitcher t={t} />
                </div>
            </SectionCard>

            <SectionCard title={t("title_tampilan_tema")} icon={Monitor} className="rounded-xl shadow-sm border-border/50">
                <div className="py-2">
                    <p className="text-xs text-muted-foreground mb-8 leading-relaxed text-left">
                        Sesuaikan mode tampilan terang atau gelap untuk kenyamanan Anda.
                    </p>
                    <ThemeSwitcher />
                </div>
            </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
}
