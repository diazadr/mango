"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { 
    Save, Loader2, Building2, 
    Mail, Phone, MapPin, Pencil, User,
    Camera, BadgeCheck, Settings, Landmark, School, Map,
    ShieldCheck, Info, Globe, ExternalLink
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent } from "@/src/components/ui/card";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { useCampusInfo } from "../hooks/useCampusInfo";
import { CampusInfoForm } from "../components/CampusInfoForm";

interface RegionalData {
    id: string;
    name: string;
}

interface OrgInfoViewProps {
  orgType?: "kampus" | "upt";
  pageTitle?: string;
  pageSubtitle?: string;
}

export function CampusInfoView({ orgType = "kampus", pageTitle, pageSubtitle }: OrgInfoViewProps) {
    const t = useTranslations("CampusInfoView");

  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  const {
    campus,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    status,
    setStatus,
    form,
    onSubmit,
  } = useCampusInfo(orgType);

  const { watch, setValue, register, formState: { errors, isDirty } } = form;
  const logoInputRef = React.useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (campus?.logo_url) {
      setLogoPreview(campus.logo_url);
    } else {
      setLogoPreview(null);
    }
  }, [campus, activeTab]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true, shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Regional States
  const [provinces, setProvinces] = React.useState<RegionalData[]>([]);
  const [regencies, setRegencies] = React.useState<RegionalData[]>([]);
  const [districts, setDistricts] = React.useState<RegionalData[]>([]);
  const [villages, setVillages] = React.useState<RegionalData[]>([]);

  const [loadingRegions, setLoadingRegions] = React.useState({
      provinces: false,
      regencies: false,
      districts: false,
      villages: false
  });

  const selectedProvince = watch("province");
  const selectedRegency = watch("regency");
  const selectedDistrict = watch("district");

  React.useEffect(() => {
    if (activeTab !== "settings") return;
    const fetchProvinces = async () => {
        setLoadingRegions(prev => ({ ...prev, provinces: true }));
        try {
            const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            const data = await res.json();
            setProvinces(data);
        } catch (err) {
            console.error("Failed to fetch provinces", err);
        } finally {
            setLoadingRegions(prev => ({ ...prev, provinces: false }));
        }
    };
    fetchProvinces();
  }, [activeTab]);

  React.useEffect(() => {
    if (activeTab !== "settings" || !selectedProvince) {
        setRegencies([]);
        return;
    }
    const fetchRegencies = async () => {
        const provinceId = provinces.find(p => p.name === selectedProvince)?.id;
        if (!provinceId) return;

        setLoadingRegions(prev => ({ ...prev, regencies: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
            const data = await res.json();
            setRegencies(data);
        } catch (err) {
            console.error("Failed to fetch regencies", err);
        } finally {
            setLoadingRegions(prev => ({ ...prev, regencies: false }));
        }
    };
    fetchRegencies();
  }, [selectedProvince, provinces, activeTab]);

  React.useEffect(() => {
    if (activeTab !== "settings" || !selectedRegency) {
        setDistricts([]);
        return;
    }
    const fetchDistricts = async () => {
        const regencyId = regencies.find(r => r.name === selectedRegency)?.id;
        if (!regencyId) return;

        setLoadingRegions(prev => ({ ...prev, districts: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
            const data = await res.json();
            setDistricts(data);
        } catch (err) {
            console.error("Failed to fetch districts", err);
        } finally {
            setLoadingRegions(prev => ({ ...prev, districts: false }));
        }
    };
    fetchDistricts();
  }, [selectedRegency, regencies, activeTab]);

  React.useEffect(() => {
    if (activeTab !== "settings" || !selectedDistrict) {
        setVillages([]);
        return;
    }
    const fetchVillages = async () => {
        const districtId = districts.find(d => d.name === selectedDistrict)?.id;
        if (!districtId) return;

        setLoadingRegions(prev => ({ ...prev, villages: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
            const data = await res.json();
            setVillages(data);
        } catch (err) {
            console.error("Failed to fetch villages", err);
        } finally {
            setLoadingRegions(prev => ({ ...prev, villages: false }));
        }
    };
    fetchVillages();
  }, [selectedDistrict, districts, activeTab]);

  React.useEffect(() => {
    if (activeTab === "settings") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [activeTab, setIsEditing]);

  React.useEffect(() => {
    if (!isEditing && activeTab === "settings") {
      setActiveTab("overview");
    }
  }, [isEditing]);

  const title = pageTitle || "Informasi Kampus";
  const subtitle = pageSubtitle || "Kelola identitas resmi institusi pendidikan dalam ekosistem MANGO.";
  const OrgIcon = Landmark;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingState message={t("message_sinkronisasi_data_institusi")} />
    </div>
  );

  if (!campus) return (
    <DashboardPageShell title={title} subtitle={subtitle} icon={OrgIcon}>
        <EmptyState icon={School} title={t("data_tidak_ditemukan")} description={t("data_institusi_tidak_ditemukan")} />
    </DashboardPageShell>
  );

  const tabs = [
    { value: "overview", label: "Ringkasan" },
    { value: "settings", label: "Pengaturan" },
  ];

  return (
    <DashboardPageShell
        title={title}
        subtitle={subtitle}
        actions={
            <div className="flex items-center gap-3">
                <TabSwitch tabs={tabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as any)} />
            </div>
        }
    >
        <div className="space-y-8">
            <StatusAlert status={status} onDismiss={() => setStatus(null)} />

            {activeTab === "overview" ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    
                    <div className="space-y-6">
                        {/* CARD 1: Profil Identitas */}
                        <SectionCard title={t("title_profil_identitas")} icon={Building2} className="rounded-2xl border-border/50">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] bg-transparent">
                                    {campus.logo_url && !campus.logo_url.includes("placeholders") ? (
                                        <img src={campus.logo_large || campus.logo_url} alt={t("alt_logo")} className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-4xl font-black text-primary">
                                            {campus.name?.charAt(0) || "I"}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground">{campus.name}</h2>
                                        {campus.is_active}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            
                                        <span className="flex items-center gap-1.5"><Mail size={14} /> {campus.email || "Email tidak tersedia"}</span>
                                        {campus.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {campus.phone}</span>}
                                    </div>
                                </div>

                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
                                    <Button className="h-11 rounded-xl shadow-sm font-bold w-full" onClick={() => setActiveTab("settings")}>
                                        <Settings size={18} className="mr-2" strokeWidth={2.5} />{t("edit_profil")}
                                    </Button>
                                </div>
                            </div>
                        </SectionCard>

                        {/* CARD 2: Ringkasan & Keterangan */}
                        <SectionCard title={t("title_ringkasan_keterangan")} icon={Info} className="rounded-2xl border-border/50">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-primary">{t("tentang_institusi")}</p>
                                    <p className="border-l-4 border-primary/20 pl-4 text-sm font-medium italic leading-relaxed text-foreground/80">
                                        {campus.description || "Belum ada deskripsi yang ditambahkan untuk institusi ini."}
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InfoRow icon={User} label={t("nama_pic")} value={campus.pic_name} />
                                    <InfoRow icon={Phone} label={t("kontak_pic")} value={campus.pic_phone} />
                                    <InfoRow icon={Building2} label={t("tipe_entitas")} value={campus.display_type || (campus.type === 'kampus' ? 'Kampus' : 'UPT')} />
                                    <InfoRow icon={MapPin} label={t("alamat_lengkap")} value={campus.address} />
                                    <InfoRow icon={Globe} label={t("provinsi")} value={campus.province} />
                                    <InfoRow icon={MapPin} label={t("kabupaten_kota")} value={campus.regency} />
                                    <InfoRow icon={MapPin} label={t("kecamatan")} value={campus.district} />
                                    <InfoRow icon={MapPin} label={t("kelurahan_desa")} value={campus.village} />
                                </div>
                                
                                {campus.address && (
                                    <div className="pt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-10 rounded-lg px-3 text-primary hover:bg-primary/5"
                                          onClick={() => {
                                            if (campus.latitude && campus.longitude) {
                                                window.open(`https://www.google.com/maps/search/?api=1&query=${campus.latitude},${campus.longitude}`, "_blank");
                                            } else {
                                                const gmapsQuery = [campus.name, campus.address, campus.village, campus.district, campus.regency, campus.province]
                                                  .filter(Boolean)
                                                  .join(", ");
                                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gmapsQuery)}`, "_blank");
                                            }
                                          }}
                                        >
                                          <MapPin size={16} className="mr-2" strokeWidth={1.5} />
                                          Buka di Peta
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <CampusInfoForm 
                        form={form}
                        onSubmit={onSubmit}
                        isSubmitting={submitting}
                        initialLogo={campus.logo_url}
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
