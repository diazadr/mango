"use client";

import { useTranslations } from "next-intl";
import React, { useRef, useState, useEffect } from "react";
import { 
  Building2, User as UserIcon, Mail, Phone, MapPin, 
  Loader2, Camera, ShieldCheck, 
  Landmark, AlertTriangle 
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

interface CampusInfoFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  t?: any;
  initialLogo?: string;
}

export const CampusInfoForm = ({ form, onSubmit, isSubmitting, initialLogo }: CampusInfoFormProps) => {
  const t = useTranslations("CampusInfoForm");

  const { register, formState: { errors, isDirty }, setValue, watch } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo || null);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [loadingRegions, setLoadingRegions] = useState({
    provinces: false, regencies: false, districts: false, villages: false
  });

  const selectedProvince = watch("province");
  const selectedRegency = watch("regency");
  const selectedDistrict = watch("district");
  const campusName = watch("name") || "";

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingRegions(prev => ({ ...prev, provinces: true }));
      try {
        const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
        const data = await res.json();
        setProvinces(data);
      } catch (err) { } finally { setLoadingRegions(prev => ({ ...prev, provinces: false })); }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvince) { setRegencies([]); return; }
    const fetchRegencies = async () => {
      const provinceId = provinces.find(p => p.name === selectedProvince)?.id;
      if (!provinceId) return;
      setLoadingRegions(prev => ({ ...prev, regencies: true }));
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
        const data = await res.json();
        setRegencies(data);
      } catch (err) { } finally { setLoadingRegions(prev => ({ ...prev, regencies: false })); }
    };
    if (provinces.length > 0) fetchRegencies();
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (!selectedRegency) { setDistricts([]); return; }
    const fetchDistricts = async () => {
      const regencyId = regencies.find(r => r.name === selectedRegency)?.id;
      if (!regencyId) return;
      setLoadingRegions(prev => ({ ...prev, districts: true }));
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) { } finally { setLoadingRegions(prev => ({ ...prev, districts: false })); }
    };
    if (regencies.length > 0) fetchDistricts();
  }, [selectedRegency, regencies]);

  useEffect(() => {
    if (!selectedDistrict) { setVillages([]); return; }
    const fetchVillages = async () => {
      const districtId = districts.find(d => d.name === selectedDistrict)?.id;
      if (!districtId) return;
      setLoadingRegions(prev => ({ ...prev, villages: true }));
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
        const data = await res.json();
        setVillages(data);
      } catch (err) { } finally { setLoadingRegions(prev => ({ ...prev, villages: false })); }
    };
    if (districts.length > 0) fetchVillages();
  }, [selectedDistrict, districts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo" as any, file, { shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "h-11 rounded-xl bg-background border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none";
  const textareaClass = "rounded-xl bg-background border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none resize-none";
  const selectClass = "w-full h-11 rounded-xl bg-background border border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none px-3";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Global Validation Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">{t("terjadi_kesalahan_validasi")}</AlertTitle>
          <AlertDescription className="text-xs opacity-80">{t("beberapa_kolom_belum_diisi_den")}</AlertDescription>
        </Alert>
      )}

      {/* ROW 1: Branding & Info (4) + Details & Description (8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4">
            <SectionCard title={t("identitas_branding")} icon={Landmark} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 rounded-2xl bg-muted/20 border border-border/50 gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 bg-transparent rounded-2xl flex items-center justify-center overflow-hidden border border-border group-hover:border-primary transition-all shadow-sm">
                                {logoPreview ? (
                                    <img src={logoPreview} alt={t("alt_logo_preview")} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-black text-3xl">
                                        {campusName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={18} />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("ubah_logo_kampus")}</p>
                    </div>

                    <div className="space-y-4">
                        <FormItem label={t("nama_institusi")} error={errors.name?.message}>
                            <Input {...register("name")} className={inputClass} placeholder={t("nama_lengkap_kampus")} disabled={isSubmitting} />
                        </FormItem>
                        <div className="grid grid-cols-1 gap-4">
                            <FormItem label={t("email_resmi")} error={errors.email?.message}>
                                <Input {...register("email")} className={inputClass} placeholder={t("email_kampus_ac_id")} disabled={isSubmitting} />
                            </FormItem>
                            <FormItem label={t("telepon_kantor")} error={errors.phone?.message}>
                                <Input {...register("phone")} className={inputClass} placeholder={t("022")} disabled={isSubmitting} />
                            </FormItem>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>

        <div className="lg:col-span-8">
            <SectionCard title={t("detail_pengelola_deskripsi")} icon={UserIcon} className="h-full rounded-xl border-border/50 shadow-none flex flex-col">
                <div className="space-y-6 flex-1 flex flex-col justify-start">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem label={t("nama_pic_direktur")} error={errors.pic_name?.message}>
                            <Input {...register("pic_name")} className={inputClass} placeholder={t("nama_lengkap_penanggung_jawab")} disabled={isSubmitting} />
                        </FormItem>
                        <FormItem label={t("no_whatsapp_pic")} error={errors.pic_phone?.message}>
                            <Input {...register("pic_phone")} className={inputClass} placeholder={t("0812")} disabled={isSubmitting} />
                        </FormItem>
                    </div>

                    <Separator className="opacity-50" />

                    <FormItem label={t("deskripsi_profil_institusi")} error={errors.description?.message}>
                        <Textarea {...register("description")} className={textareaClass + " min-h-[140px]"} placeholder={t("jelaskan_visi_misi_atau_profil")} disabled={isSubmitting} />
                    </FormItem>
                </div>
            </SectionCard>
        </div>
      </div>

      {/* ROW 2: Location (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-12">
            <SectionCard title={t("lokasi_alamat_kampus")} icon={MapPin} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <FormItem label={t("alamat_lengkap")} error={errors.address?.message}>
                            <Textarea {...register("address")} className={textareaClass + " min-h-[105px]"} placeholder={t("alamat_lengkap_gedung_direktor")} disabled={isSubmitting} />
                        </FormItem>
                        <FormItem label={t("provinsi")} error={errors.province?.message}>
                            <div className="relative">
                                <select {...register("province")} className={selectClass} disabled={loadingRegions.provinces || isSubmitting}>
                                    <option value="">{t("pilih_provinsi")}</option>
                                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                                {loadingRegions.provinces && <Loader2 className="absolute right-3 top-3 animate-spin h-5 w-5 text-primary" />}
                            </div>
                        </FormItem>
                    </div>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label={t("kota_kabupaten")} error={errors.regency?.message}>
                                <div className="relative">
                                    <select {...register("regency")} className={selectClass} disabled={!selectedProvince || loadingRegions.regencies || isSubmitting}>
                                        <option value="">{t("pilih_kota_kab")}</option>
                                        {regencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                    </select>
                                    {loadingRegions.regencies && <Loader2 className="absolute right-4 top-3 animate-spin h-5 w-5 text-primary" />}
                                </div>
                            </FormItem>
                            <FormItem label={t("kecamatan")} error={errors.district?.message}>
                                <div className="relative">
                                    <select {...register("district")} className={selectClass} disabled={!selectedRegency || loadingRegions.districts || isSubmitting}>
                                        <option value="">{t("pilih_kecamatan")}</option>
                                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                    {loadingRegions.districts && <Loader2 className="absolute right-4 top-3 animate-spin h-5 w-5 text-primary" />}
                                </div>
                            </FormItem>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label={t("kelurahan_desa")} error={errors.village?.message}>
                                <div className="relative">
                                    <select {...register("village")} className={selectClass} disabled={!selectedDistrict || loadingRegions.villages || isSubmitting}>
                                        <option value="">{t("pilih_kel_desa")}</option>
                                        {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                    </select>
                                    {loadingRegions.villages && <Loader2 className="absolute right-4 top-3 animate-spin h-5 w-5 text-primary" />}
                                </div>
                            </FormItem>
                            <FormItem label={t("kode_pos")} error={errors.postal_code?.message}>
                                <Input {...register("postal_code")} className={inputClass} placeholder={t("12345")} disabled={isSubmitting} />
                            </FormItem>
                        </div>
                    </div>
                </div>

                <Separator className="my-6 opacity-50" />

                {/* Coordinates */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wide mb-3">Titik Koordinat (Opsional)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Latitude" error={errors.latitude?.message}>
                      <Input {...register("latitude")} className={inputClass} placeholder="-6.123456" disabled={isSubmitting} />
                    </FormItem>
                    <FormItem label="Longitude" error={errors.longitude?.message}>
                      <div className="flex gap-2">
                        <Input {...register("longitude")} className={inputClass} placeholder="106.123456" disabled={isSubmitting} />
                        <Button
                          type="button" variant="outline" size="icon"
                          className="h-11 w-11 rounded-xl shrink-0"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                setValue("latitude", pos.coords.latitude.toString(), { shouldDirty: true });
                                setValue("longitude", pos.coords.longitude.toString(), { shouldDirty: true });
                              });
                            }
                          }}
                          title="Gunakan Lokasi Saat Ini"
                        >
                          <MapPin size={18} className="text-primary" />
                        </Button>
                      </div>
                    </FormItem>
                  </div>
                  {/* Map Preview */}
                  {watch("latitude") && watch("longitude") && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-border/50 h-48 bg-muted/20 relative group">
                      <iframe
                        width="100%" height="100%" frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${watch("latitude")},${watch("longitude")}&z=15&output=embed`}
                        allowFullScreen
                      />
                      <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 group-hover:border-primary/40 transition-colors rounded-2xl" />
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm border border-primary/10">
                        Preview Lokasi
                      </div>
                    </div>
                  )}
                </div>
            </SectionCard>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-background/80 backdrop-blur-md border-t border-border p-4 z-50 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-3 text-muted-foreground">
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                    disabled={!isDirty || isSubmitting}
                    className="flex-1 md:flex-none h-11 rounded-xl font-bold px-6"
                >{t("reset")}</Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-[2] md:flex-none px-10 h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    {t("simpan_perubahan")}
                </Button>
            </div>
        </div>
      </div>
    </form>
  );
};

function FormItem({ label, children, error }: { label: string, children: React.ReactNode, error?: any }) {
    return (
        <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold text-muted-foreground ml-1">{label}</Label>
            {children}
            {error && <p className="text-[10px] font-medium text-destructive ml-1">{error}</p>}
        </div>
    );
}
