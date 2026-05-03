"use client";

import React from "react";
import { 
    Store, Save, Loader2, Building2, 
    Mail, Phone, MapPin, Pencil, X, User,
    Camera, Check
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { useOrganizationInfo } from "../hooks/useOrganizationInfo";

interface RegionalData {
    id: string;
    name: string;
}

export function OrganizationInfoView({ pageTitle, pageSubtitle }: OrganizationInfoViewProps) {
  const {
    organization,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    status,
    setStatus,
    form,
    onSubmit,
  } = useOrganizationInfo();

  const { watch, setValue, register, formState: { errors } } = form;
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (organization?.logo_url) {
      setLogoPreview(organization.logo_url);
    } else {
      setLogoPreview(null);
    }
  }, [organization, isEditing]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file, { shouldValidate: true });
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

  // 1. Fetch Provinces
  React.useEffect(() => {
    if (!isEditing) return;
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
  }, [isEditing]);

  // 2. Fetch Regencies when province changes
  React.useEffect(() => {
    if (!isEditing || !selectedProvince) {
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
  }, [selectedProvince, provinces, isEditing]);

  // 3. Fetch Districts when regency changes
  React.useEffect(() => {
    if (!isEditing || !selectedRegency) {
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
  }, [selectedRegency, regencies, isEditing]);

  // 4. Fetch Villages when district changes
  React.useEffect(() => {
    if (!isEditing || !selectedDistrict) {
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
  }, [selectedDistrict, districts, isEditing]);

  const selectClass = "flex h-10 w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

  const title = pageTitle || "Profil Organisasi UMKM";
  const subtitle = pageSubtitle || "Kelola identitas resmi organisasi atau paguyuban dalam ekosistem MANGO.";
  const OrgIcon = Store;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingState message="Sinkronisasi data organisasi..." />
    </div>
  );

  if (!organization) return (
    <DashboardPageShell title={title} subtitle={subtitle} icon={OrgIcon}>
        <EmptyState icon={Building2} title="Data tidak ditemukan" description="Data organisasi tidak ditemukan atau Anda tidak memiliki akses." />
    </DashboardPageShell>
  );

  return (
    <DashboardPageShell
        title={title}
        subtitle={subtitle}
        icon={OrgIcon}
    >
        <div className="space-y-6">
            <StatusAlert status={status} onDismiss={() => setStatus(null)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
                {!isEditing ? (
                    <Card>
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Store size={18} className="text-primary" /> Detail Organisasi
                                </CardTitle>
                                <CardDescription>Detail identitas resmi paguyuban atau UPT yang terdaftar.</CardDescription>
                            </div>
                            <Button 
                                onClick={() => setIsEditing(true)}
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                            >
                                <Pencil size={14} /> Edit profil
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Nama Organisasi</p>
                                    <p className="text-base font-bold text-foreground">{organization.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pengurus (PIC)</p>
                                    <p className="text-sm text-foreground font-semibold flex items-center gap-2">
                                        <User size={14} className="text-primary" /> {organization.pic_name || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Email Resmi</p>
                                    <p className="text-sm text-foreground flex items-center gap-2 font-medium">
                                        <Mail size={14} className="text-primary" /> {organization.email || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">No. WhatsApp PIC</p>
                                    <p className="text-sm text-foreground flex items-center gap-2 font-medium">
                                        <Phone size={14} className="text-primary" /> {organization.pic_phone || organization.phone || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1 md:col-span-2 pt-4 border-t border-dashed">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Deskripsi Organisasi</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium italic">
                                        {organization.description || "Belum ada deskripsi organisasi."}
                                    </p>
                                </div>
                                <div className="space-y-1 md:col-span-2 pt-4 border-t border-dashed">
                                    <p className="text-xs font-medium text-muted-foreground">Alamat Lengkap</p>
                                    <div className="flex gap-2 items-start mt-1">
                                        <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                        <div className="text-sm text-foreground/80 leading-relaxed">
                                            <p className="font-semibold">{organization.address || "Alamat belum diatur"}</p>
                                            <p className="text-xs">
                                                {[
                                                    organization.village,
                                                    organization.district,
                                                    organization.regency,
                                                    organization.province
                                                ].filter(Boolean).join(', ')}
                                                {organization.postal_code && ` - ${organization.postal_code}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-primary/20 ring-2 ring-primary/5">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-primary flex items-center gap-2 text-base">
                                    <Pencil size={18} /> Edit Informasi
                                </CardTitle>
                                <CardDescription>Perbarui data profil dan kontak organisasi.</CardDescription>
                            </div>
                            <Button 
                                onClick={() => setIsEditing(false)}
                                variant="ghost" 
                                size="icon-sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                            >
                                <X size={18} />
                            </Button>
                        </CardHeader>
                        <form onSubmit={onSubmit}>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Nama Organisasi</Label>
                                    <Input {...register("name")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all font-medium" />
                                    {errors.name && <p className="text-[10px] font-bold text-destructive ml-1">Nama wajib diisi</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Nama Pengurus (PIC)</Label>
                                        <Input {...register("pic_name")} placeholder="Nama Lengkap Penanggung Jawab" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">No. WhatsApp PIC</Label>
                                        <Input {...register("pic_phone")} placeholder="Contoh: 0812..." className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Deskripsi Organisasi</Label>
                                    <textarea 
                                        {...register("description")} 
                                        className="flex min-h-[100px] w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Jelaskan visi, misi, atau profil singkat paguyuban UMKM Anda..."
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-dashed">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Email Resmi</Label>
                                        <Input {...register("email")} type="email" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">No. Telepon Kantor</Label>
                                        <Input {...register("phone")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-dashed">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Alamat Jalan</Label>
                                    <Input {...register("address")} placeholder="Contoh: Jl. Industri No. 123" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Provinsi</Label>
                                        <div className="relative">
                                            <select {...register("province")} className={selectClass} disabled={loadingRegions.provinces}>
                                                <option value="">-- Pilih Provinsi --</option>
                                                {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                            </select>
                                            {loadingRegions.provinces && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kabupaten / Kota</Label>
                                        <div className="relative">
                                            <select {...register("regency")} className={selectClass} disabled={!selectedProvince || loadingRegions.regencies}>
                                                <option value="">-- Pilih Kabupaten/Kota --</option>
                                                {regencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                            </select>
                                            {loadingRegions.regencies && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kecamatan</Label>
                                        <div className="relative">
                                            <select {...register("district")} className={selectClass} disabled={!selectedRegency || loadingRegions.districts}>
                                                <option value="">-- Pilih Kecamatan --</option>
                                                {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                            </select>
                                            {loadingRegions.districts && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kelurahan / Desa</Label>
                                        <div className="relative">
                                            <select {...register("village")} className={selectClass} disabled={!selectedDistrict || loadingRegions.villages}>
                                                <option value="">-- Pilih Kelurahan/Desa --</option>
                                                {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                            </select>
                                            {loadingRegions.villages && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kode Pos</Label>
                                        <Input {...register("postal_code")} placeholder="40123" maxLength={5} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all font-mono" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 p-6 flex gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 gap-2"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan Perubahan
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-primary text-primary-foreground border-primary/20 shadow-lg shadow-primary/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-widest opacity-70">Identitas Visual</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 relative z-10 space-y-6 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 bg-primary-foreground/10 rounded-3xl flex items-center justify-center ring-4 ring-primary-foreground/5 shadow-2xl overflow-hidden border-2 border-primary-foreground/20">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={56} className="text-primary-foreground/40" />
                                )}
                            </div>
                            
                            {isEditing && (
                                <button 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                                >
                                    <Camera size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold tracking-tight line-clamp-2">{organization.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                                {organization.display_type || organization.entity_type}
                            </p>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={logoInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleLogoChange} 
                        />
                    </CardContent>
                </Card>

                {/* Additional Stats/Info if needed */}
                <Card className="border-dashed border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                            <span>Status Verifikasi</span>
                            <span className="text-green-600 flex items-center gap-1"><Check size={14} /> Terverifikasi</span>
                        </div>
                        <div className="space-y-3">
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="w-full h-full bg-primary" />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Profil organisasi Anda telah lengkap dan tervalidasi oleh sistem MANGO.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </DashboardPageShell>
  );
}
