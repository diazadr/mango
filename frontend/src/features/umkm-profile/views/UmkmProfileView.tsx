"use client";

import React, { useState } from "react";
import { 
  Building2, User as UserIcon, CreditCard, Phone, MapPin, 
  Landmark, Coins, Hash, Calendar, Users as UsersIcon,
  FileText, Briefcase, Info, BadgeCheck, Globe, Loader2, Settings,
  Zap, Droplets, ShieldCheck, Recycle, Activity, Target, MessageSquare, Factory, Download, ExternalLink, Camera, Share2, Clock, ShoppingBag, MessageCircle
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
import { CertificationManager } from "../components/CertificationManager";
import { IndiScoreCard } from "../components/IndiScoreCard";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { onboardingService } from "../../onboarding/services/onboardingService";

export function UmkmProfileView() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [isDownloading, setIsDownloading] = useState(false);
  const { 
    user, 
    form, 
    onSubmit, 
    isSubmitting, 
    status, 
    setStatus,
    organizations,
    refreshUser
  } = useUmkmProfile();
  
  const t = useTranslations("OnboardingPage");
  const umkmProfileT = useTranslations("UmkmProfilePage");

  if (!user?.umkm) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  const umkm = user.umkm;

  const tabs = [
    { value: "overview", label: umkmProfileT("tabs.overview") || "Ikhtisar" },
    { value: "settings", label: umkmProfileT("tabs.settings") || "Pengaturan" },
  ];

  const days = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' },
  ];

  const operatingHours = umkm.operating_hours || {};

  const handleDownloadResume = async () => {
    if (!umkm.uuid) return;
    setIsDownloading(true);
    try {
        const res = await onboardingService.downloadResume(umkm.uuid);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `MANGO-Resume-${umkm.slug}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error(err);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phone = umkm.phone?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Halo ${umkm.name}, saya melihat profil bisnis Anda di platform MANGO dan tertarik untuk berdiskusi lebih lanjut.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <DashboardPageShell
      title={umkmProfileT("title")}
      subtitle={umkmProfileT("subtitle")}
      actions={
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-primary/20 text-primary font-bold hidden md:flex"
                onClick={handleDownloadResume}
                disabled={isDownloading}
            >
                {isDownloading ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText size={16} className="mr-2" strokeWidth={1.5} />}
                Ekspor Resume (PDF)
            </Button>
            <TabSwitch tabs={tabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as any)} />
        </div>
      }
    >
      <div className="space-y-8">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {activeTab === "overview" ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* ROW 1: Business ID + Strategic Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Side: Stats & ID */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <ProfileCompleteness umkm={umkm} t={t} />
                    
                    <IndiScoreCard score={umkm.latest_assessment_score || 0} t={t} />

                    <div className="bg-primary text-primary-foreground rounded-xl p-8 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between border border-primary/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Building2 size={120} strokeWidth={1.5} />
                        </div>
                        
                        <div className="relative z-10 space-y-8 flex flex-col items-center">
                            <div className="flex justify-center w-full relative">
                                <div className="w-24 h-24 rounded-[1.5rem] shadow-2xl overflow-hidden border-4 border-white/20 bg-white/10 flex-shrink-0">
                                    {umkm.logo_url && !umkm.logo_url.includes('placeholders') ? (
                                        <img src={umkm.logo_large || umkm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white flex items-center justify-center text-primary font-black text-3xl uppercase">
                                            {umkm.name?.charAt(0) || "M"}
                                        </div>
                                    )}
                                </div>
                                <BadgeCheck className="text-white opacity-40 absolute right-0 top-0" size={28} strokeWidth={1.5} />
                            </div>

                            <div className="space-y-1 text-center w-full">
                                <p className="text-xs font-medium opacity-70 tracking-tight">{t("registration_id")}</p>
                                <h3 className="text-2xl font-bold tracking-tight">{umkm.registration_number || "MANGO-IKM-Pending"}</h3>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10 w-full mt-auto">
                                <div className="text-center">
                                    <p className="text-xs font-medium opacity-70 mb-1">{t("company_name_label")}</p>
                                    <p className="text-lg font-bold truncate">{umkm.name}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pb-2">
                                    <div>
                                        <p className="text-xs font-medium opacity-70 mb-1">{t("legal_entity")}</p>
                                        <p className="text-sm font-bold">{umkm.legal_entity_type || t("legal_entity_options.Perseorangan")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium opacity-70 mb-1">{t("established_year_label")}</p>
                                        <p className="text-sm font-bold">{umkm.established_year ? `${t("since") || "Berdiri sejak"} ${umkm.established_year}` : "-"}</p>
                                    </div>                                </div>

                                <Button 
                                    className="w-full bg-white text-primary hover:bg-white/90 font-black rounded-xl h-11 shadow-lg border-none"
                                    onClick={handleWhatsAppClick}
                                >
                                    <MessageCircle size={18} className="mr-2 fill-primary text-white" strokeWidth={1.5} />
                                    Hubungi via WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Strategic Profile & Financials */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <SectionCard title={t("strategic_financial_profile")} icon={Briefcase} className="flex-1 rounded-xl border-border/50">
                        <div className="space-y-8 py-2">
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-primary">{t("about_business")}</p>
                                <p className="text-sm font-medium leading-relaxed text-foreground/80 border-l-4 border-primary/20 pl-4 py-1 italic">
                                    {umkm.description || "Belum ada deskripsi bisnis."}
                                </p>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem icon={PackageIcon} label={t("main_product")} value={umkm.profile?.main_product} />
                                <InfoItem icon={Target} label={t("market_target")} value={umkm.profile?.market_target} />
                            </div>
                        </div>
                    </SectionCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionCard title={t("digital_presence")} icon={Globe} className="rounded-xl border-border/50">
                            <div className="space-y-3">
                                <SocialLink icon={Globe} label={t("website_label")} value={umkm.website} isLink />
                            </div>
                        </SectionCard>

                        <SectionCard title={t("legal_documents")} icon={FileText} className="rounded-xl border-border/50">
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground mb-2">{t("quick_download_access")}</p>
                                <Button variant="outline" className="w-full justify-between rounded-xl h-11 text-xs font-bold border-border/50 hover:bg-muted/30" onClick={() => umkm.nib_url && window.open(umkm.nib_url, '_blank')}>
                                    <span className="flex items-center gap-2"><FileText size={14} className="text-primary" strokeWidth={1.5} /> {t("nib_number")} (NIB)</span>
                                    <Download size={14} strokeWidth={1.5} />
                                </Button>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>

            {/* ROW 2: Verification Status, Location, and Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-3">
                    <SectionCard title={t("verification_status")} icon={ShieldCheck} className="h-full rounded-xl border-border/50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">{t("account_status")}</span>
                                <Badge className={`rounded-md font-bold px-2 py-0.5 text-[10px] whitespace-nowrap ${umkm.is_active ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                                    {umkm.is_active ? "Aktif" : "Menunggu Verifikasi"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 overflow-hidden">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">{t("nib_number")}</span>
                                <span className="text-sm font-bold font-mono truncate text-right">{umkm.nib || "-"}</span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-muted-foreground tracking-tight">{t("certifications_owned")}</p>
                                <div className="flex flex-wrap gap-2">
                                    {umkm.certifications && umkm.certifications.length > 0 ? (
                                        umkm.certifications.map((cert: string) => (
                                            <Badge key={cert} variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-md px-2 py-0.5 text-[10px] font-bold">
                                                {cert}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs italic text-muted-foreground">{t("no_certifications")}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="lg:col-span-5">
                    <SectionCard title={t("business_location")} icon={MapPin} className="h-full rounded-xl border-border/50">
                        <div className="space-y-6 py-2">
                            <InfoItem icon={MapPin} label={t("full_address")} value={umkm.address} />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem icon={Globe} label={t("province")} value={umkm.province} />
                                <InfoItem icon={MapPin} label={t("regency")} value={umkm.regency} />
                            </div>
                            <div className="flex gap-4 items-center justify-between border-t border-border/50 pt-4">
                                <InfoItem icon={MapPin} label={t("district")} value={umkm.district} />
                                {umkm.latitude && (
                                    <Button variant="ghost" size="sm" className="rounded-lg text-primary hover:bg-primary/5 h-10 px-3" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`, '_blank')}>
                                        <MapPin size={16} className="mr-2" strokeWidth={1.5} /> Peta
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="lg:col-span-4">
                    <SectionCard title={t("certification_docs")} icon={BadgeCheck} className="md:col-span-2 rounded-xl border-border/50 bg-primary/5 border-primary/10">
                        <CertificationManager umkm={umkm} onRefresh={refreshUser} t={t} setStatus={setStatus} />
                    </SectionCard>
                </div>
            </div>

            {/* ROW 3: Operating Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-12">
                    <SectionCard title={t("operating_hours_label")} icon={Clock} className="h-full rounded-xl border-border/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 py-2">
                            {days.map((day) => {
                                const hours = operatingHours[day.key] || {};
                                return (
                                    <div key={day.key} className={`p-3 rounded-xl border flex flex-col items-center gap-3 transition-all ${hours.closed ? 'bg-muted/10 border-border/50 opacity-60' : 'bg-primary/5 border-primary/10 shadow-sm'}`}>
                                        <p className="text-xs font-bold text-muted-foreground">{day.label}</p>
                                        <Separator className="w-6 opacity-50" />
                                        {hours.closed ? (
                                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-none text-muted-foreground font-bold">{t("closed")}</Badge>
                                        ) : (
                                            <div className="text-center space-y-0.5">
                                                <p className="text-xs font-bold text-primary">{hours.open || '08:00'}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground">s/d</p>
                                                <p className="text-xs font-bold text-primary">{hours.close || '17:00'}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>
            </div>
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

function SocialLink({ icon: Icon, label, value, isLink = false, url }: { icon: any, label: string, value?: string, isLink?: boolean, url?: string | null }) {
    if (!value) return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/10 border border-dashed border-border opacity-50">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Icon size={14} strokeWidth={1.5} /> {label}</span>
            <span className="text-xs font-bold italic">-</span>
        </div>
    );

    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-border/50 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Icon size={14} className="text-primary" strokeWidth={1.5} /> {label}</span>
            {isLink ? (
                <a href={url || value} target="_blank" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline truncate max-w-[120px]">
                    {value} <ExternalLink size={10} strokeWidth={1.5} />
                </a>
            ) : (
                <span className="text-xs font-bold text-foreground truncate">{value}</span>
            )}
        </div>
    );
}

function InfoItem({ icon: Icon, label, value, isCaps = false }: { icon: any, label: string, value: string | number, isCaps?: boolean }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0">
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 text-primary/70">
          <Icon size={16} strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground/70 tracking-tight">{label}</p>
        <p className={`text-sm font-bold text-foreground leading-tight truncate ${isCaps ? 'uppercase' : ''}`}>{value || "-"}</p>
      </div>
    </div>
  );
}

function PackageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}
