"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Badge } from "@/src/components/ui/badge";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { useTranslations } from "next-intl";
import { useUmkmProfile } from "../hooks/useUmkmProfile";
import { UmkmProfileForm } from "../components/UmkmProfileForm";
import { ProfileCompleteness } from "../components/ProfileCompleteness";
import { IndiScoreCard } from "../components/IndiScoreCard";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { onboardingService } from "../../onboarding/services/onboardingService";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/src/components/ui/dialog";

export function UmkmProfileView() {
  const t = useTranslations("UmkmProfileView");
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCompletenessOpen, setIsCompletenessOpen] = useState(false);
  const {
    user,
    form,
    onSubmit,
    isSubmitting,
    status,
    setStatus,
    organizations,
  } = useUmkmProfile();

  const umkmProfileT = useTranslations("UmkmProfilePage");

  if (!user?.umkm) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const umkm = user.umkm;

  const tabs = [
    { value: "overview", label: umkmProfileT("tabs.overview") || "Ringkasan" },
    { value: "settings", label: umkmProfileT("tabs.settings") || "Pengaturan" },
  ];

  const days = [
    { key: "monday", label: "Senin" },
    { key: "tuesday", label: "Selasa" },
    { key: "wednesday", label: "Rabu" },
    { key: "thursday", label: "Kamis" },
    { key: "friday", label: "Jumat" },
    { key: "saturday", label: "Sabtu" },
    { key: "sunday", label: "Minggu" },
  ];

  const operatingHours = umkm.operating_hours || {};

  const handleDownloadResume = async () => {
    if (!umkm.uuid) return;
    setIsDownloading(true);
    try {
      const res = await onboardingService.downloadResume(umkm.uuid);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `MANGO-Resume-${umkm.slug || umkm.name?.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download PDF failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = umkm.phone?.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(`Halo ${umkm.name}, saya melihat profil bisnis Anda di platform MANGO dan tertarik untuk berdiskusi lebih lanjut.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <DashboardPageShell
      title={umkmProfileT("title")}
      subtitle={umkmProfileT("subtitle")}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold text-sm gap-2"
            onClick={handleDownloadResume}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} strokeWidth={1.5} />}
            {isDownloading ? "Mengunduh..." : "Unduh PDF"}
          </Button>
          <TabSwitch tabs={tabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as "overview" | "settings")} />
        </div>
      }
    >
      <div className="space-y-8">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {activeTab === "overview" ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <SectionCard title={t("title_identitas_bisnis")} icon={Building2} className="rounded-2xl border-border/50">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] bg-primary/5 shadow-lg ring-1 ring-border/30">
                  {umkm.logo_url && !umkm.logo_url.includes("placeholders") ? (
                    <img src={umkm.logo_large || umkm.logo_url} alt={t("alt_logo")} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-primary">
                      {umkm.name?.charAt(0) || "M"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">{umkm.name}</h2>
                    {umkm.is_active && <BadgeCheck className="text-primary" size={22} strokeWidth={2} />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-muted/30 font-mono text-[10px] tracking-wide">
                      {umkm.registration_number || "MANGO-IKM-Pending"}
                    </Badge>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} />
                      {umkm.legal_entity_type || t("legal_entity_options.Perseorangan")}
                    </span>
                    {umkm.established_year && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Est. {umkm.established_year}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
                  <Button className="h-11 rounded-xl bg-[#25D366] font-bold text-white hover:bg-[#1ebd57]" onClick={handleWhatsAppClick}>
                    <MessageCircle size={18} className="mr-2" strokeWidth={2.5} />
                    Hubungi
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 justify-between rounded-xl border-border/50"
                    onClick={() => umkm.nib_url && window.open(umkm.nib_url, "_blank")}
                    disabled={!umkm.nib_url}
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-primary" strokeWidth={1.5} />
                      Dokumen NIB
                    </span>
                    <ExternalLink size={14} strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={t("title_ringkasan_keterangan")}
              icon={Globe}
              className="rounded-2xl border-border/50"
              headerAction={
                <Dialog open={isCompletenessOpen} onOpenChange={setIsCompletenessOpen}>
                </Dialog>
              }
            >
              <div className="space-y-8">

                <div className="space-y-3">
                  <p className="text-sm font-bold text-primary">{t("about_business")}</p>
                  <p className="border-l-4 border-primary/20 pl-4 text-sm font-medium italic leading-relaxed text-foreground/80">
                    {umkm.description || "Belum ada deskripsi bisnis."}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoRow icon={UserIcon} label={t("owner_name")} value={umkm.owner_name} />
                  <InfoRow icon={FileText} label={t("nib_number")} value={umkm.nib} />
                  <InfoRow icon={MapPin} label={t("full_address")} value={umkm.address} />
                  <InfoRow icon={Globe} label={t("website_label")} value={umkm.website} />
                  <InfoRow icon={MapPin} label={t("province")} value={umkm.province} />
                  <InfoRow icon={MapPin} label={t("regency")} value={umkm.regency} />
                  <InfoRow icon={MapPin} label={t("district")} value={umkm.district} />
                  <InfoRow icon={ShieldCheck} label={t("account_status")} value={umkm.is_active ? "Aktif" : "Menunggu Verifikasi"} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <p className="text-sm font-bold text-primary">{t("operating_hours_label")}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {days.map((day) => {
                      const hours = operatingHours[day.key] || {};

                      return (
                        <div
                          key={day.key}
                          className={`rounded-xl border p-3 text-center ${
                            hours.closed ? "border-border/50 bg-muted/10 opacity-60" : "border-primary/10 bg-primary/5"
                          }`}
                        >
                          <p className="text-xs font-bold text-muted-foreground">{day.label}</p>
                          <Separator className="mx-auto my-2 w-8 opacity-50" />
                          {hours.closed ? (
                            <Badge variant="outline" className="border-none text-xs font-bold text-muted-foreground">
                              {t("closed")}
                            </Badge>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-primary">{hours.open || "08:00"}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">s/d</p>
                              <p className="text-xs font-bold text-primary">{hours.close || "17:00"}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {umkm.latitude && umkm.longitude && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-lg px-3 text-primary hover:bg-primary/5"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`, "_blank")}
                    >
                      <MapPin size={16} className="mr-2" strokeWidth={1.5} />
                      Buka di Peta
                    </Button>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <UmkmProfileForm
              form={form}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              organizations={organizations}
              t={t}
              initialLogo={umkm.logo_url}
            />
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3 border-b border-dashed border-border/60 pb-4">
      <div className="rounded-lg bg-primary/5 p-2 text-primary">
        <Icon size={15} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-tight text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-bold leading-tight text-foreground">{value || "-"}</p>
      </div>
    </div>
  );
}
