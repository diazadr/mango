"use client";

import React, { useRef, useState, useEffect } from "react";
import { Store, User as UserIcon, Calendar, Users as UsersIcon, Briefcase, FileText, Loader2, Building2, Phone, MapPin, Landmark, Coins, Hash, Settings, Info, Camera, ShieldCheck, Target, Activity, Globe, MessageSquare, Share2, Clock, Moon, AlertTriangle, ShoppingBag, Flame, Recycle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Badge } from "@/src/components/ui/badge";
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

  // Debugging: Log errors to console if they exist
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Validation Errors:", errors);
    }
  }, [errors]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

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

  const inputClass = "h-11 rounded-lg bg-white border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none";
  const textareaClass = "rounded-lg bg-white border-input focus:border-primary focus:ring-0 font-medium text-sm transition-colors outline-none resize-none";

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Global Validation Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">Terjadi kesalahan validasi</AlertTitle>
          <AlertDescription className="text-xs opacity-80">
            Beberapa kolom belum diisi dengan benar. Silakan periksa kembali data Anda di bawah ini.
          </AlertDescription>
        </Alert>
      )}

      {/* ROW 1: Branding & Digital (4) + Strategic (8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4">
            <SectionCard title={t("identity_branding") || "Identitas & branding"} icon={Store} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-center p-6 rounded-2xl bg-muted/20 border border-border/50 gap-4">
                        <div className="relative group cursor-pointer" onClick={handleLogoClick}>
                            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-border group-hover:border-primary transition-all shadow-sm">
                                {logoPreview && !logoPreview.includes('placeholders') ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-black text-3xl uppercase">
                                        {businessName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={18} />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("change_logo") || "Ubah logo"}</p>
                    </div>

                    <div className="space-y-4">
                        <FormItem label={t("company_name")} error={errors.name?.message}>
                            <Input {...register("name")} className={inputClass} placeholder="Nama UMKM" disabled={isSubmitting} />
                        </FormItem>
                        <FormItem label={t("sector")} error={errors.sector?.message}>
                            <Input {...register("sector")} className={inputClass} placeholder="Sektor" disabled={isSubmitting} />
                        </FormItem>
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label={t("phone")} error={errors.phone?.message}>
                                <Input {...register("phone")} className={inputClass} placeholder="Telepon" disabled={isSubmitting} />
                            </FormItem>
                            <FormItem label={t("email")} error={errors.email?.message}>
                                <Input {...register("email")} className={inputClass} placeholder="Email" disabled={isSubmitting} />
                            </FormItem>
                        </div>
                        
                        <Separator className="opacity-50" />
                        
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("digital_presence")}</p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">{t("website_label")}</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 text-muted-foreground/50" size={16} />
                                        <Input {...register("website")} className={inputClass + " pl-10"} placeholder="https://..." disabled={isSubmitting} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>

        <div className="lg:col-span-8">
            <SectionCard title={t("strategic_financial_profile")} icon={Briefcase} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="space-y-6 py-2">
                    <FormItem label={t("company_description")} error={errors.description?.message}>
                        <Textarea {...register("description")} className={textareaClass + " min-h-[100px]"} placeholder={t("company_description_placeholder")} disabled={isSubmitting} />
                    </FormItem>

                    <Separator className="opacity-50" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem label={t("established_year_label")} error={errors.established_year?.message}>
                            <select 
                                {...register("established_year")}
                                className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors"
                                disabled={isSubmitting}
                            >
                                {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem label={t("main_product")} error={errors.main_product?.message}>
                            <Input {...register("main_product")} className={inputClass} placeholder="Produk" disabled={isSubmitting} />
                        </FormItem>
                        <FormItem label={t("market_target")} error={errors.market_target?.message}>
                            <Input {...register("market_target")} className={inputClass} placeholder="Target" disabled={isSubmitting} />
                        </FormItem>
                    </div>
                </div>
            </SectionCard>
        </div>
      </div>

      {/* ROW 2: Legal (4) + Location (8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4">
            <SectionCard title={t("legal_documents") || "Data legalitas"} icon={ShieldCheck} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                        <FormItem label={t("organization") || "Organisasi/Paguyuban"}>
                            <select 
                                {...register("organization_id")}
                                className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors"
                                disabled={isSubmitting}
                            >
                                <option value="">Tanpa Organisasi</option>
                                {organizations.map((org: any) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </FormItem>
                    </div>
                    <FormItem label={t("legal_entity_type")} error={errors.legal_entity_type?.message}>
                        <select 
                            {...register("legal_entity_type")}
                            className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors"
                            disabled={isSubmitting}
                        >
                            <option value="Perseorangan">Perseorangan</option>
                            <option value="CV">CV</option>
                            <option value="PT">PT</option>
                            <option value="PT Perorangan">PT Perorangan</option>
                        </select>
                    </FormItem>
                    <FormItem label={t("nib") + " (Terkunci)"} error={errors.nib?.message}>
                        <Input {...register("nib")} disabled={true} className="h-11 rounded-lg bg-muted/40 border-none font-mono text-xs opacity-60" />
                    </FormItem>
                </div>
            </SectionCard>
        </div>

        <div className="lg:col-span-8">
            <SectionCard title={t("business_location")} icon={MapPin} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <FormItem label={t("full_address")} error={errors.address?.message}>
                            <Textarea {...register("address")} className={textareaClass + " min-h-[105px]"} placeholder="Alamat..." disabled={isSubmitting} />
                        </FormItem>
                        <FormItem label={t("province")} error={errors.province?.message}>
                            <Input {...register("province")} className={inputClass} placeholder="Provinsi" disabled={isSubmitting} />
                        </FormItem>
                    </div>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label={t("regency")} error={errors.regency?.message}>
                                <Input {...register("regency")} className={inputClass} placeholder="Kota/Kabupaten" disabled={isSubmitting} />
                            </FormItem>
                            <FormItem label={t("district")} error={errors.district?.message}>
                                <Input {...register("district")} className={inputClass} placeholder="Kecamatan" disabled={isSubmitting} />
                            </FormItem>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem label={t("village") || "Desa/Kelurahan"} error={errors.village?.message}>
                                <Input {...register("village")} className={inputClass} placeholder="Desa/Kelurahan" disabled={isSubmitting} />
                            </FormItem>
                            <FormItem label={t("postal_code_label") || "Kode Pos"} error={errors.postal_code?.message}>
                                <Input {...register("postal_code")} className={inputClass} placeholder="12345" disabled={isSubmitting} />
                            </FormItem>
                        </div>
                        
                        <Separator className="opacity-50" />
                        
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("coordinate_points")} ({t("optional")})</p>
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem label={t("latitude_label") || "Latitude"} error={errors.latitude?.message}>
                                    <Input {...register("latitude")} className={inputClass + " font-mono text-xs"} placeholder="-6.12345" disabled={isSubmitting} />
                                </FormItem>
                                <FormItem label={t("longitude_label") || "Longitude"} error={errors.longitude?.message}>
                                    <Input {...register("longitude")} className={inputClass + " font-mono text-xs"} placeholder="106.12345" disabled={isSubmitting} />
                                </FormItem>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
      </div>

      {/* ROW 3: Operating Hours (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-12">
            <SectionCard title="Alur produksi & operasional" icon={Settings} className="h-full rounded-xl border-border/50 shadow-none">
                <div className="space-y-8 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-5 space-y-6">
                            {/* Removed production_workflow and has_sop */}
                        </div>
                        
                        <div className="md:col-span-7 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-muted-foreground ml-1">Atur waktu operasional</p>
                                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/10">{t("operating_hours_format")}</Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {days.map((day) => (
                                    <div key={day.key} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="col-span-3">
                                            <Label className="text-xs font-bold">{day.label}</Label>
                                        </div>
                                        <div className="col-span-3">
                                            <Input 
                                                type="text" 
                                                {...register(`operating_hours.${day.key}.open`)} 
                                                className="h-9 text-sm font-medium px-3" 
                                                disabled={isSubmitting || watch(`operating_hours.${day.key}.closed`)}
                                                placeholder="08:00"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center text-muted-foreground text-xs">s/d</div>
                                        <div className="col-span-3">
                                            <Input 
                                                type="text" 
                                                {...register(`operating_hours.${day.key}.close`)} 
                                                className="h-9 text-sm font-medium px-3" 
                                                disabled={isSubmitting || watch(`operating_hours.${day.key}.closed`)}
                                                placeholder="17:00"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2 justify-end">
                                            <input 
                                                type="checkbox" 
                                                id={`closed_${day.key}`}
                                                {...register(`operating_hours.${day.key}.closed`)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-0 cursor-pointer"
                                            />
                                            <Label htmlFor={`closed_${day.key}`} className="text-xs font-bold text-muted-foreground cursor-pointer">{t("closed")}</Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-72 bg-white/80 backdrop-blur-md border-t border-border p-4 z-50 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className={isDirty ? "text-primary animate-pulse" : "text-primary/50"} size={18} />
                <p className="text-xs italic">
                    {isDirty ? "Ada perubahan yang belum disimpan." : "Profil sinkron dengan server."}
                </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                    type="button" 
                    variant="outline" 
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

function FormItem({ label, children, error }: { label: string, children: React.ReactNode, error?: any }) {
    return (
        <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold text-muted-foreground ml-1">{label}</Label>
            {children}
            {error && <p className="text-[10px] font-medium text-destructive ml-1">{error}</p>}
        </div>
    );
}
