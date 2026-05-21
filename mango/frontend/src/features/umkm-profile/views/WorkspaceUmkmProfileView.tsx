"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Save, 
  Loader2, 
  Pencil,
  Building2,
  AlertCircle,
  X,
  Target,
  ChevronRight,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { useTranslations } from "next-intl";

export function WorkspaceUmkmProfileView() {
  const t = useTranslations("WorkspaceUmkmProfileView");
    const [umkm, setUmkm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    const [formData, setFormData] = useState({
        main_product: "",
        market_target: "",
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userRes = await api.get("/v1/me");
            const userData = userRes.data.data?.user || userRes.data.user;
            
            if (userData.umkm) {
                setUmkm(userData.umkm);
                
                try {
                    const profileRes = await api.get(`/v1/umkm/${userData.umkm.id}/profile`);
                    const profile = profileRes.data.data || profileRes.data;
                    
                    if (profile) {
                        setFormData({
                            main_product: profile.main_product || "",
                            market_target: profile.market_target || "",
                        });
                        setHasProfile(true);
                    } else {
                        setHasProfile(false);
                        setIsEditing(true);
                    }
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        setHasProfile(false);
                        setIsEditing(true);
                    }
                }
            }
        } catch (err) {
            console.error("Gagal mengambil data profil:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!umkm) return;
        setSubmitting(true);
        setStatus(null);
        try {
            const payload = {
                ...formData,
            };
            
            await api.post(`/v1/umkm/${umkm.id}/profile`, payload);
            setStatus({ type: "success", message: t("msg_business_profile_saved_successfully") });
            setHasProfile(true);
            setIsEditing(false);
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to save profile." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="mt-4 text-sm text-muted-foreground animate-pulse">{t("memuat_data_profil_strategis")}</p>
        </div>
    );

    if (!umkm) return (
        <DashboardPageShell title={t("title_profil_strategis")} subtitle={t("title_pengaturan_visi_misi_bisnis")}>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <AlertCircle size={40} className="text-muted-foreground opacity-30" />
                <h2 className="text-xl font-bold">{t("umkm_belum_terdaftar")}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Silakan daftarkan unit usaha Anda terlebih dahulu pada menu Registry UMKM untuk mengelola profil strategis.
                </p>
            </div>
        </DashboardPageShell>
    );

    return (
        <DashboardPageShell
            title={t("title_profil_strategis_1")}
            subtitle={t("title_definisikan_arah_dan_tujuan_jangka_panja")}
           
        >
            <div className="space-y-6">
                {status && (
                    <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="flex items-center justify-between">
                            {status.message}
                            <button onClick={() => setStatus(null)} className="ml-4">
                                <X size={16} className="opacity-50 hover:opacity-100" />
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Active UMKM Banner */}
                <div className="flex items-center justify-between p-4 bg-muted/30 border rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-primary" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground leading-none">{t("unit_bisnis_aktif")}</p>
                            <p className="text-sm font-bold text-foreground mt-1">{umkm.name}</p>
                        </div>
                    </div>
                    {!isEditing && hasProfile && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(`/id/document/umkm/${umkm.id}`, '_blank')} className="gap-2 rounded-lg text-primary border-primary/20 hover:bg-primary/5 font-semibold">
                                <FileText size={14} /> Cetak Resume
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 rounded-lg font-semibold">
                                <Pencil size={14} /> Edit Profil
                            </Button>
                        </div>
                    )}
                    {isEditing && hasProfile && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="gap-2 rounded-lg">
                            <X size={14} /> Batal
                        </Button>
                    )}
                </div>

                {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
                                <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                                    <CardTitle className="text-lg font-bold text-primary tracking-tight">{t("kinerja_operasional")}</CardTitle>
                                    <CardDescription>{t("rincian_data_produk_dan_target_pasar")}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground tracking-wide">{t("produk_unggulan")}</p>
                                            <p className="text-sm font-bold">{formData.main_product || "—"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground tracking-wide">{t("target_pasar")}</p>
                                            <p className="text-sm font-bold">{formData.market_target || "—"}</p>
                                        </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-1">
                            <Card className="border-primary/20 shadow-lg shadow-primary/5 rounded-3xl overflow-hidden bg-primary text-primary-foreground p-6">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xs font-black tracking-wide opacity-80">{t("strategic_overview")}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-6">
                                    <div className="flex flex-col items-center py-4">
                                        <div className="w-20 h-20 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary-foreground/5 shadow-2xl">
                                            <Target size={32} className="text-primary-foreground" />
                                        </div>
                                        <p className="text-xs font-medium text-center opacity-80 leading-relaxed px-4">
                                            Profil strategis membantu sistem mencocokkan bisnis Anda dengan advisor yang tepat.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card className="border-primary/20 shadow-xl rounded-3xl overflow-hidden bg-white ring-4 ring-primary/5">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 p-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight text-primary flex items-center gap-2">
                                    <Pencil size={20} className="text-primary" /> Atur Profil Strategis
                                </CardTitle>
                                <CardDescription className="font-medium">{t("sesuaikan_arah_tujuan_jangka_panjang_uni")}</CardDescription>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-wide text-muted-foreground ml-1">{t("produk_utama")}</Label>
                                        <Input 
                                            value={formData.main_product}
                                            onChange={(e) => setFormData({...formData, main_product: e.target.value})}
                                            placeholder={t("placeholder_contoh_kain_batik_tulis")}
                                            className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black tracking-wide text-muted-foreground ml-1">{t("target_pasar_1")}</Label>
                                        <Input 
                                            value={formData.market_target}
                                            onChange={(e) => setFormData({...formData, market_target: e.target.value})}
                                            placeholder={t("placeholder_contoh_lokal_ekspor_eropa")}
                                            className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 p-8 flex gap-4">
                                {hasProfile && (
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-12 rounded-xl font-bold border-muted-foreground/20">
                                        Batal
                                    </Button>
                                )}
                                <Button type="submit" disabled={submitting} className="flex-1 h-12 rounded-xl font-black text-xs tracking-wide gap-2 bg-primary shadow-lg shadow-primary/20">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan Profil Strategis
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>
        </DashboardPageShell>
    );
}
