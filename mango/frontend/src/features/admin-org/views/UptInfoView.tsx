"use client";

import { useTranslations } from "next-intl";
import React, { useState, useCallback, useEffect } from "react";
import {
    Save, Building2, Mail, Phone, MapPin,
    Settings, Info, ShieldCheck, Globe, User, BadgeCheck,
    School, Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { CampusInfoForm } from "@/src/features/admin-campus/components/CampusInfoForm";
import { api } from "@/src/lib/http/axios";
import { useAuth } from "@/src/components/providers/AuthProvider";

// Reuse same schema shape as campus
const uptSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    pic_name: z.string().optional(),
    pic_phone: z.string().optional(),
    description: z.string().optional(),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    province: z.string().optional(),
    regency: z.string().optional(),
    district: z.string().optional(),
    village: z.string().optional(),
    postal_code: z.string().optional(),
});
type UptFormData = z.infer<typeof uptSchema>;

interface UptInfoViewProps {
    pageTitle?: string;
    pageSubtitle?: string;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
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

export function UptInfoView({ pageTitle, pageSubtitle }: UptInfoViewProps) {
    const { user: currentUser } = useAuth();
    const t = useTranslations("UptInfoView");

    const [org, setOrg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    const form = useForm<UptFormData>({
        resolver: zodResolver(uptSchema),
        defaultValues: {
            name: "", pic_name: "", pic_phone: "", description: "",
            email: "", phone: "", address: "", province: "",
            regency: "", district: "", village: "", postal_code: "",
        },
    });

    // Fetch org data from /v1/my/organizations (UPT is linked to Organization model)
    const fetchOrg = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/v1/my/organizations");
            // Response is a collection: [{...}]
            const list: any[] = Array.isArray(res.data)
                ? res.data
                : (res.data?.data || []);
            const myOrg = list[0] ?? null;

            if (myOrg) {
                setOrg(myOrg);
                form.reset({
                    name:        myOrg.name        || "",
                    pic_name:    myOrg.pic_name    || currentUser?.name || "",
                    pic_phone:   myOrg.pic_phone   || currentUser?.phone || "",
                    description: myOrg.description || "",
                    email:       myOrg.email       || "",
                    phone:       myOrg.phone       || "",
                    address:     myOrg.address     || "",
                    province:    myOrg.province    || "",
                    regency:     myOrg.regency     || "",
                    district:    myOrg.district    || "",
                    village:     myOrg.village     || "",
                    postal_code: myOrg.postal_code || "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch UPT organization:", err);
        } finally {
            setLoading(false);
        }
    }, [form, currentUser]);

    useEffect(() => { fetchOrg(); }, [fetchOrg]);

    // Sync tabs → editing state (same pattern as CampusInfoView)
    useEffect(() => {
        if (activeTab !== "settings") return;
    }, [activeTab]);

    const onSubmit = form.handleSubmit(async (data: UptFormData) => {
        if (!org) return;
        setSubmitting(true);
        setStatus(null);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([k, v]) => {
                if (v !== undefined && v !== null) formData.append(k, v as string);
            });
            formData.append("_method", "PUT");
            await api.post(`/v1/my/organizations/${org.id}`, formData);
            setStatus({ type: "success", message: t("msg_data_unit_pengelola_berhasil_diperbarui") });
            setActiveTab("overview");
            fetchOrg();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal memperbarui data." });
        } finally {
            setSubmitting(false);
        }
    });

    const title    = pageTitle    || "Profil Manajemen Organisasi";
    const subtitle = pageSubtitle || "Kelola identitas resmi Manajemen Organisasi (UPT) dalam ekosistem MANGO.";

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center">
            <LoadingState message={t("message_sinkronisasi_data_unit_pengelola")} />
        </div>
    );

    if (!org) return (
        <DashboardPageShell title={title} subtitle={subtitle} icon={Building2}>
            <EmptyState
                icon={Building2}
                title={t("title_data_tidak_ditemukan")}
                description={t("description_data_unit_pengelola_belum_tersedia_atau")}
            />
        </DashboardPageShell>
    );

    const tabs = [
        { value: "overview",  label: "Ringkasan" },
        { value: "settings",  label: "Pengaturan" },
    ];

    return (
        <DashboardPageShell
            title={title}
            subtitle={subtitle}
            icon={Building2}
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

                        {/* ── Identity Card (same style as CampusInfoView) ── */}
                        <SectionCard title={t("title_profil_identitas")} icon={Building2} className="rounded-2xl border-border/50">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                {/* Logo / Avatar */}
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-background bg-primary/5 shadow-lg">
                                    {org.logo_url && !org.logo_url.includes("placeholders") ? (
                                        <img src={org.logo_large || org.logo_url} alt={t("alt_logo")} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl font-black text-primary">
                                            {org.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>

                                {/* Name & contact */}
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground">{org.name}</h2>
                                        {org.is_active && <BadgeCheck className="text-primary" size={22} strokeWidth={2} />}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Mail size={14} /> {org.email || "Email tidak tersedia"}</span>
                                        {org.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {org.phone}</span>}
                                    </div>
                                </div>

                                {/* Edit button */}
                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
                                    <button
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                                        onClick={() => setActiveTab("settings")}
                                    >
                                        <Settings size={18} strokeWidth={2.5} /> Edit Profil
                                    </button>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Info Details ── */}
                        <SectionCard title={t("title_ringkasan_keterangan")} icon={Info} className="rounded-2xl border-border/50">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-primary">{t("tentang_unit_pengelola")}</p>
                                    <p className="border-l-4 border-primary/20 pl-4 text-sm font-medium italic leading-relaxed text-foreground/80">
                                        {org.description || "Belum ada deskripsi yang ditambahkan untuk unit pengelola ini."}
                                    </p>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <InfoRow icon={User}       label={t("label_nama_pic_koordinator")}  value={org.pic_name} />
                                    <InfoRow icon={Phone}      label={t("label_kontak_pic")}               value={org.pic_phone} />
                                    <InfoRow icon={ShieldCheck} label={t("label_status_akun")}             value={org.is_active ? "Aktif" : "Non-Aktif"} />
                                    <InfoRow icon={Building2}  label={t("label_tipe_entitas")}             value={org.display_type || org.entity_type || "Manajemen Organisasi (UPT)"} />
                                    <InfoRow icon={MapPin}     label={t("label_alamat_lengkap")}           value={org.address} />
                                    <InfoRow icon={Globe}      label={t("label_provinsi")}                 value={org.province} />
                                    <InfoRow icon={MapPin}     label={t("label_kabupaten_kota")}         value={org.regency} />
                                    <InfoRow icon={MapPin}     label={t("label_kecamatan")}                value={org.district} />
                                    <InfoRow icon={MapPin}     label={t("label_kelurahan_desa")}         value={org.village} />
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        {/* Reuse the same CampusInfoForm — it's layout-agnostic */}
                        <CampusInfoForm
                            form={form}
                            onSubmit={onSubmit}
                            isSubmitting={submitting}
                            initialLogo={org.logo_url}
                        />
                    </div>
                )}
            </div>
        </DashboardPageShell>
    );
}
