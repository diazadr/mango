"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Store, Loader2, Camera, Upload, FileCheck, AlertTriangle, MapPin, Globe, Check
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { CompanyFormData } from "../schema/onboardingSchema";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { motion } from "framer-motion";

interface CompanyFormProps {
  form: UseFormReturn<CompanyFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  organizations: any[];
  t: any;
  initialLogo?: string | null;
}

interface RegionalData {
    id: string;
    name: string;
}

export const CompanyForm = ({ form, onSubmit, isSubmitting, organizations, t, initialLogo }: CompanyFormProps) => {
  const { register, formState: { errors }, setValue, watch } = form;
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const nibInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialLogo && !initialLogo.includes('placeholders') ? initialLogo : null
  );

  // Watch company name for fallback
  const companyName = watch("name");
  const firstLetter = companyName?.charAt(0).toUpperCase() || "M";
  const [nibFileName, setNibFileName] = useState<string | null>(null);

  // Regional States
  const [provinces, setProvinces] = useState<RegionalData[]>([]);
  const [regencies, setRegencies] = useState<RegionalData[]>([]);
  const [districts, setDistricts] = useState<RegionalData[]>([]);
  const [villages, setVillages] = useState<RegionalData[]>([]);

  const [loadingRegions, setLoadingRegions] = useState({
      provinces: false,
      regencies: false,
      districts: false,
      villages: false
  });

  const selectedProvince = watch("province");
  const selectedRegency = watch("regency");
  const selectedDistrict = watch("district");

  // 1. Fetch Provinces
  useEffect(() => {
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
  }, []);

  // 2. Fetch Regencies when province changes
  useEffect(() => {
    if (!selectedProvince) {
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
  }, [selectedProvince, provinces]);

  // 3. Fetch Districts when regency changes
  useEffect(() => {
    if (!selectedRegency) {
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
  }, [selectedRegency, regencies]);

  // 4. Fetch Villages when district changes
  useEffect(() => {
    if (!selectedDistrict) {
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
  }, [selectedDistrict, districts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CompanyFormData, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(field as any, file, { shouldValidate: true, shouldDirty: true });
      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (field === 'logo') setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setNibFileName(file.name);
      }
    }
  };

  const selectClass = "flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary disabled:opacity-50 transition-all";

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-10">
      
      {/* Global Error Notice */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-bold">Data belum lengkap</AlertTitle>
          <AlertDescription className="text-xs">
            Ada beberapa kolom wajib yang belum diisi atau formatnya salah. Silakan periksa kolom bertanda merah di bawah.
          </AlertDescription>
        </Alert>
      )}

      {/* 1. Brand Identity Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground">Identitas Usaha</h3>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
                <div 
                    className={`relative group cursor-pointer h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${errors.logo ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/30 hover:border-primary/40'}`}
                    onClick={() => logoInputRef.current?.click()}
                >
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-2xl uppercase">
                            {firstLetter}
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white h-6 w-6" />
                    </div>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo', 'image')} />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("click_to_upload_logo")}</p>
            </div>

            <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("company_name")}</Label>
                    <Input {...register("name")} placeholder={t("company_name_placeholder")} className="h-11 rounded-xl" />
                    {errors.name && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.name.message}`)}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("legal_entity")}</Label>
                    <select {...register("legal_entity_type")} className={selectClass}>
                        <option value="Perseorangan">{t("legal_entity_options.Perseorangan")}</option>
                        <option value="CV">{t("legal_entity_options.CV")}</option>
                        <option value="PT">{t("legal_entity_options.PT")}</option>
                        <option value="PT Perorangan">{t("legal_entity_options.PT Perorangan")}</option>
                        <option value="Koperasi">{t("legal_entity_options.Koperasi")}</option>
                        <option value="Lainnya">{t("legal_entity_options.Lainnya")}</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
        <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("phone")}</Label>
            <Input {...register("phone")} placeholder={t("phone_placeholder")} className="h-11 rounded-xl" />
            {errors.phone && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.phone.message}`)}</p>}
        </div>

        <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("npwp")} (Opsional)</Label>
            <Input {...register("npwp")} placeholder={t("npwp_placeholder")} className="h-11 rounded-xl font-mono text-xs" />
        </div>
      </div>

      {/* 2. Legal Documentation Section */}
      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-bold text-foreground">Dokumen Legalitas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Unggah Dokumen NIB</Label>
                <div 
                    onClick={() => nibInputRef.current?.click()}
                    className={`h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-muted/50 ${nibFileName ? 'border-primary/40 bg-primary/5' : errors.nib_file ? 'border-destructive bg-destructive/5' : 'border-border'}`}
                >
                    {nibFileName ? (
                        <>
                            <FileCheck size={20} className="text-primary" />
                            <span className="text-[11px] font-bold truncate max-w-[150px]">{nibFileName}</span>
                        </>
                    ) : (
                        <>
                            <Upload size={20} className="text-muted-foreground/30" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("click_to_upload_file")}</span>
                        </>
                    )}
                </div>
                <input type="file" ref={nibInputRef} className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'nib_file', 'file')} />
                {errors.nib_file && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.nib_file.message}`)}</p>}
            </div>
        </div>
      </div>

      {/* 3. Location & Operasional Section */}
      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MapPin size={20} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Lokasi & Operasional</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("address")}</Label>
                <Input {...register("address")} placeholder={t("address_placeholder")} className="h-11 rounded-xl" />
                {errors.address && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.address.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("province")}</Label>
                <div className="relative">
                    <select {...register("province")} className={selectClass} disabled={loadingRegions.provinces}>
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    {loadingRegions.provinces && <Loader2 className="absolute right-3 top-3 animate-spin h-4 w-4 text-primary" />}
                </div>
                {errors.province && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.province.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("regency")}</Label>
                <div className="relative">
                    <select {...register("regency")} className={selectClass} disabled={!selectedProvince || loadingRegions.regencies}>
                        <option value="">-- Pilih Kabupaten/Kota --</option>
                        {regencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                    {loadingRegions.regencies && <Loader2 className="absolute right-3 top-3 animate-spin h-4 w-4 text-primary" />}
                </div>
                {errors.regency && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.regency.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Kecamatan</Label>
                <div className="relative">
                    <select {...register("district")} className={selectClass} disabled={!selectedRegency || loadingRegions.districts}>
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    {loadingRegions.districts && <Loader2 className="absolute right-3 top-3 animate-spin h-4 w-4 text-primary" />}
                </div>
                {errors.district && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.district.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Kelurahan / Desa</Label>
                <div className="relative">
                    <select {...register("village")} className={selectClass} disabled={!selectedDistrict || loadingRegions.villages}>
                        <option value="">-- Pilih Kelurahan/Desa --</option>
                        {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                    {loadingRegions.villages && <Loader2 className="absolute right-3 top-3 animate-spin h-4 w-4 text-primary" />}
                </div>
                {errors.village && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.village.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Kode Pos</Label>
                <Input {...register("postal_code")} placeholder="Contoh: 40123" className="h-11 rounded-xl font-mono" maxLength={5} />
                {errors.postal_code && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.postal_code.message}`)}</p>}
            </div>

            <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{t("sector")}</Label>
                    <select 
                        className={selectClass}
                        value={watch("sector") === "" ? "" : (["Industri Makanan & Minuman", "Industri Tekstil & Konveksi", "Industri Produk Kulit & Alas Kaki", "Industri Pengolahan Kayu & Furniture", "Industri Logam, Mesin & Elektronik", "Industri Kimia, Farmasi & Kosmetik", "Industri Kerajinan & Barang Seni", "Industri Teknologi Informasi (Software/IT)"].includes(watch("sector")) ? watch("sector") : "Lainnya")}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val !== "Lainnya") {
                                setValue("sector", val, { shouldValidate: true });
                            } else {
                                setValue("sector", "", { shouldValidate: true });
                            }
                        }}
                    >
                        <option value="">-- Pilih Sektor Industri --</option>
                        <option value="Industri Makanan & Minuman">Industri Makanan & Minuman</option>
                        <option value="Industri Tekstil & Konveksi">Industri Tekstil & Konveksi</option>
                        <option value="Industri Produk Kulit & Alas Kaki">Industri Produk Kulit & Alas Kaki</option>
                        <option value="Industri Pengolahan Kayu & Furniture">Industri Pengolahan Kayu & Furniture</option>
                        <option value="Industri Logam, Mesin & Elektronik">Industri Logam, Mesin & Elektronik</option>
                        <option value="Industri Kimia, Farmasi & Kosmetik">Industri Kimia, Farmasi & Kosmetik</option>
                        <option value="Industri Kerajinan & Barang Seni">Industri Kerajinan & Barang Seni</option>
                        <option value="Industri Teknologi Informasi (Software/IT)">Industri Teknologi Informasi (Software/IT)</option>
                        <option value="Lainnya">Lainnya (Sebutkan...)</option>
                    </select>
                </div>
                
                {(watch("sector") === "" || !["Industri Makanan & Minuman", "Industri Tekstil & Konveksi", "Industri Produk Kulit & Alas Kaki", "Industri Pengolahan Kayu & Furniture", "Industri Logam, Mesin & Elektronik", "Industri Kimia, Farmasi & Kosmetik", "Industri Kerajinan & Barang Seni", "Industri Teknologi Informasi (Software/IT)"].includes(watch("sector"))) && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 pl-4 border-l-2 border-primary/20"
                    >
                        <Label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Sektor Spesifik</Label>
                        <Input 
                            {...register("sector")} 
                            placeholder="Sebutkan sektor industri Anda secara spesifik..." 
                            className="h-10 rounded-xl bg-primary/5 border-primary/20 focus:border-primary"
                        />
                    </motion.div>
                )}
                {errors.sector && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.sector.message}`)}</p>}
            </div>
            
            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nomor Induk Berusaha (NIB)</Label>
                <Input {...register("nib")} className="h-11 rounded-xl font-mono text-sm" placeholder="Masukkan NIB" />
                {errors.nib && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.nib.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Tahun Berdiri</Label>
                <Input {...register("established_year", { valueAsNumber: true })} type="number" placeholder="YYYY" className="h-11 rounded-xl" />
                {errors.established_year && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.established_year.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Jumlah Karyawan</Label>
                <Input {...register("employee_count", { valueAsNumber: true })} type="number" min={0} placeholder="Contoh: 5" className="h-11 rounded-xl" />
                {errors.employee_count && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.employee_count.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Afiliasi Organisasi (Jika Ada)</Label>
                <select {...register("umkm_organization_id", { valueAsNumber: true })} className={`flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary ${errors.umkm_organization_id ? 'border-destructive' : 'border-input'}`}>
                    <option value="0">-- Tidak Ada / Mandiri --</option>
                    {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1 ml-1 italic">Pilih organisasi atau paguyuban jika Anda merupakan bagian dari kelompok tersebut.</p>
            </div>
        </div>
      </div>

      <div className="pt-6">
        <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95"
        >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            {t("save_continue")}
        </Button>
      </div>
    </form>
  );
};
