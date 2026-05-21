"use client";

import React, { useRef, useState, useEffect } from "react";
import { Store, User as UserIcon, Calendar, Briefcase, FileText, Loader2, Phone, MapPin, Coins, Camera, ShieldCheck, Globe, Clock, AlertTriangle } from "lucide-react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { TimePicker } from "@/src/components/ui/date-time-picker";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

interface UmkmProfileFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  organizations: any[];
  t: any;
  initialLogo?: string;
}

export const UmkmProfileForm = ({ form, onSubmit, isSubmitting, organizations, t, initialLogo }: UmkmProfileFormProps) => {
  const { register, formState: { errors, isDirty }, setValue, watch } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialLogo && !initialLogo.includes('placeholders') ? initialLogo : null
  );

  const businessName = watch("name") || "M";

  // Regional States
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Validation Errors:", errors);
    }
  }, [errors]);

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo" as any, file, { shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const inputClass = "h-11 rounded-xl bg-background border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none";
  const textareaClass = "rounded-xl bg-background border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none resize-none";
  const selectClass = "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium focus:border-primary outline-none transition-colors disabled:opacity-50";

  const days = [
    { key: 'monday', label: t("monday") || 'Senin' },
    { key: 'tuesday', label: t("tuesday") || 'Selasa' },
    { key: 'wednesday', label: t("wednesday") || 'Rabu' },
    { key: 'thursday', label: t("thursday") || 'Kamis' },
    { key: 'friday', label: t("friday") || 'Jumat' },
    { key: 'saturday', label: t("saturday") || 'Sabtu' },
    { key: 'sunday', label: t("sunday") || 'Minggu' },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* Global Validation Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">Terjadi kesalahan validasi</AlertTitle>
          <AlertDescription className="text-xs opacity-80">
            Beberapa kolom belum diisi dengan benar. Silakan periksa kembali data Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── MAIN CARD ─── */}
      <SectionCard title="Identitas & Branding" icon={Store} className="rounded-xl border-border/50 shadow-none">
        <div className="space-y-6">
          {/* Logo + Nama + Sektor */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="relative group cursor-pointer" onClick={handleLogoClick}>
                <div className="w-24 h-24 bg-background rounded-2xl flex items-center justify-center overflow-hidden border border-border group-hover:border-primary transition-all shadow-sm">
                  {logoPreview && !logoPreview.includes('placeholders') ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-black text-3xl">
                      {businessName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={18} />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("change_logo") || "Ubah logo"}</p>
            </div>

            {/* Name + Sector + Phone + Email */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormItem label={t("company_name")} error={errors.name?.message} className="sm:col-span-2">
                <Input {...register("name")} className={inputClass} placeholder="Nama UMKM" disabled={isSubmitting} />
              </FormItem>
              <FormItem label={t("sector")} error={errors.sector?.message}>
                <Input {...register("sector")} className={inputClass} placeholder="Sektor bisnis" disabled={isSubmitting} />
              </FormItem>
              <FormItem label={t("established_year_label")} error={errors.established_year?.message}>
                <select {...register("established_year")} className={selectClass} disabled={isSubmitting}>
                  <option value="">Tahun berdiri</option>
                  {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </FormItem>
              <FormItem label={t("phone")} error={errors.phone?.message}>
                <Input {...register("phone")} className={inputClass} placeholder="Telepon" disabled={isSubmitting} />
              </FormItem>
              <FormItem label={t("email")} error={errors.email?.message}>
                <Input {...register("email")} className={inputClass} placeholder="Email bisnis" disabled={isSubmitting} />
              </FormItem>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Description */}
          <FormItem label={t("company_description")} error={errors.description?.message}>
            <Textarea {...register("description")} className={textareaClass + " min-h-[120px]"} placeholder={t("company_description_placeholder")} disabled={isSubmitting} />
          </FormItem>

          {/* Website */}
          <FormItem label={t("website_label")} error={errors.website?.message}>
            <div className="relative">
              <Globe className="absolute left-3 top-3 text-muted-foreground/50" size={16} />
              <Input {...register("website")} className={inputClass + " pl-10"} placeholder="https://..." disabled={isSubmitting} />
            </div>
          </FormItem>
        </div>
      </SectionCard>

      {/* ─── LEGALITAS & LOKASI ─── */}
      <SectionCard title="Legalitas & Lokasi" icon={ShieldCheck} className="rounded-xl border-border/50 shadow-none">
        <div className="space-y-6">
          {/* Legal fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormItem label={t("legal_entity_type")} error={errors.legal_entity_type?.message}>
              <select {...register("legal_entity_type")} className={selectClass} disabled={isSubmitting}>
                <option value="Perseorangan">Perseorangan</option>
                <option value="CV">CV</option>
                <option value="PT">PT</option>
                <option value="PT Perorangan">PT Perorangan</option>
              </select>
            </FormItem>
            <FormItem label={t("organization") || "Organisasi/Paguyuban"}>
              <select {...register("organization_id")} className={selectClass} disabled={isSubmitting}>
                <option value="">Tanpa Organisasi</option>
                {organizations.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </FormItem>
            <FormItem label={t("nib") + " (Terkunci)"} error={errors.nib?.message}>
              <Input {...register("nib")} disabled={true} className="h-11 rounded-xl bg-muted/40 border-none font-mono text-xs opacity-60" />
            </FormItem>
          </div>

          <Separator className="opacity-50" />

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormItem label={t("full_address")} error={errors.address?.message} className="sm:col-span-2">
              <Textarea {...register("address")} className={textareaClass + " min-h-[80px]"} placeholder="Alamat lengkap..." disabled={isSubmitting} />
            </FormItem>
            <FormItem label={t("province")} error={errors.province?.message}>
              <div className="relative">
                <select {...register("province")} className={selectClass} disabled={loadingRegions.provinces || isSubmitting}>
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                {loadingRegions.provinces && <Loader2 className="absolute right-3 top-3 animate-spin h-5 w-5 text-primary" />}
              </div>
            </FormItem>
            <FormItem label={t("regency")} error={errors.regency?.message}>
              <div className="relative">
                <select {...register("regency")} className={selectClass} disabled={!selectedProvince || loadingRegions.regencies || isSubmitting}>
                  <option value="">-- Pilih Kota/Kab --</option>
                  {regencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
                {loadingRegions.regencies && <Loader2 className="absolute right-3 top-3 animate-spin h-5 w-5 text-primary" />}
              </div>
            </FormItem>
            <FormItem label={t("district")} error={errors.district?.message}>
              <div className="relative">
                <select {...register("district")} className={selectClass} disabled={!selectedRegency || loadingRegions.districts || isSubmitting}>
                  <option value="">-- Pilih Kecamatan --</option>
                  {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                {loadingRegions.districts && <Loader2 className="absolute right-3 top-3 animate-spin h-5 w-5 text-primary" />}
              </div>
            </FormItem>
            <FormItem label={t("village") || "Desa/Kelurahan"} error={errors.village?.message}>
              <div className="relative">
                <select {...register("village")} className={selectClass} disabled={!selectedDistrict || loadingRegions.villages || isSubmitting}>
                  <option value="">-- Pilih Kel/Desa --</option>
                  {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
                {loadingRegions.villages && <Loader2 className="absolute right-3 top-3 animate-spin h-5 w-5 text-primary" />}
              </div>
            </FormItem>
            <FormItem label={t("postal_code_label") || "Kode Pos"} error={errors.postal_code?.message}>
              <Input {...register("postal_code")} className={inputClass} placeholder="12345" disabled={isSubmitting} />
            </FormItem>
          </div>

          <Separator className="opacity-50" />

          {/* Coordinates */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground tracking-wide mb-3">{t("coordinate_points")} ({t("optional")})</p>
            <div className="grid grid-cols-2 gap-4">
              <FormItem label={t("latitude_label")} error={errors.latitude?.message}>
                <Input {...register("latitude")} className={inputClass} placeholder="-6.123456" disabled={isSubmitting} />
              </FormItem>
              <FormItem label={t("longitude_label")} error={errors.longitude?.message}>
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
        </div>
      </SectionCard>

      {/* ─── JAM OPERASIONAL ─── */}
      <SectionCard title={t("operating_hours_label") || "Waktu Operasional"} icon={Clock} className="rounded-xl border-border/50 shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {days.map((day) => (
            <div
              key={day.key}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all ${watch(`operating_hours.${day.key}.closed`) ? 'bg-muted/10 border-border/50 opacity-60' : 'bg-card border-primary/20 shadow-sm'}`}
            >
              <div className="w-20">
                <Label className="text-sm font-bold">{day.label}</Label>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Controller
                  name={`operating_hours.${day.key}.open`}
                  control={form.control}
                  render={({ field }) => (
                    <TimePicker 
                      value={field.value} 
                      onChange={field.onChange} 
                      disabled={isSubmitting || watch(`operating_hours.${day.key}.closed`)}
                    />
                  )}
                />
                <span className="text-muted-foreground text-xs font-bold tracking-wide flex-shrink-0 mx-1">s/d</span>
                <Controller
                  name={`operating_hours.${day.key}.close`}
                  control={form.control}
                  render={({ field }) => (
                    <TimePicker 
                      value={field.value} 
                      onChange={field.onChange} 
                      disabled={isSubmitting || watch(`operating_hours.${day.key}.closed`)}
                    />
                  )}
                />
              </div>
              <div className="sm:w-20 flex items-center sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                <input
                  type="checkbox"
                  id={`closed_${day.key}`}
                  {...register(`operating_hours.${day.key}.closed`)}
                  className="h-4 w-4 rounded border-gray-300 accent-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor={`closed_${day.key}`} className="text-xs font-bold text-muted-foreground cursor-pointer select-none">{t("closed")}</Label>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-background/80 backdrop-blur-md border-t border-border p-4 z-50 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-3 text-muted-foreground">
            {isDirty && (
              <>
                <ShieldCheck className="text-primary animate-pulse" size={18} />
                <p className="text-xs italic">Ada perubahan yang belum disimpan.</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              type="button" variant="outline"
              onClick={() => form.reset()}
              disabled={!isDirty || isSubmitting}
              className="flex-1 md:flex-none h-11 rounded-xl font-bold px-6"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] md:flex-none px-10 h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

function FormItem({ label, children, error, className }: { label: string, children: React.ReactNode, error?: any, className?: string }) {
  return (
    <div className={`space-y-1.5 w-full ${className || ""}`}>
      <Label className="text-xs font-bold text-muted-foreground ml-1">{label}</Label>
      {children}
      {error && <p className="text-[10px] font-medium text-destructive ml-1">{error}</p>}
    </div>
  );
}
