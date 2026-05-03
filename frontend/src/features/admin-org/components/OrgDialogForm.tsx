"use client";

import { Loader2, X, Save, CheckCircle2, Camera, Building2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { OrganizationFormData } from "../schema/orgSchema";

interface OrgDialogFormProps {
  form: UseFormReturn<OrganizationFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
  editingOrg: any;
  t: any;
  tc: any;
}

interface RegionalData {
    id: string;
    name: string;
}

export const OrgDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  onClose,
  editingOrg,
  t,
  tc,
}: OrgDialogFormProps) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(editingOrg?.logo_url || null);

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
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  const selectClass = "flex h-10 w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{editingOrg ? t("edit_title") : t("add")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {editingOrg ? "Perbarui data identitas institusi" : "Daftarkan institusi baru ke sistem"}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-center pb-2">
            <div className="relative group">
                <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border overflow-hidden ring-offset-2 ring-primary/20 group-hover:border-primary/50 transition-all">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Building2 size={32} className="text-muted-foreground/40" />
                    )}
                </div>
                <button 
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-lg shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                >
                    <Camera size={14} />
                </button>
                <input 
                    type="file" 
                    ref={logoInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                />
            </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Nama institusi/organisasi</Label>
            <Input {...register("name")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all font-medium" disabled={isSubmitting} />
            {errors.name && <p className="text-[10px] font-bold text-destructive ml-1">Nama wajib diisi</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Nama Pengurus (PIC)</Label>
              <Input {...register("pic_name")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">No. WhatsApp PIC</Label>
              <Input {...register("pic_phone")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Deskripsi</Label>
            <textarea 
                {...register("description")} 
                className="flex min-h-[80px] w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Tipe</Label>
              <select 
                {...register("type")}
                className={selectClass}
                disabled={isSubmitting}
              >
                <option value="kampus">Kampus</option>
                <option value="upt">UPT</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Status</Label>
              <select 
                {...register("is_active", { setValueAs: (v) => v === "true" })}
                className={selectClass}
                disabled={isSubmitting}
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Email resmi</Label>
              <Input {...register("email")} type="email" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Telepon</Label>
              <Input {...register("phone")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-dashed">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Alamat Jalan</Label>
            <Input {...register("address")} placeholder="Contoh: Jl. Industri No. 123" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Provinsi</Label>
                <div className="relative">
                    <select {...register("province")} className={selectClass} disabled={loadingRegions.provinces || isSubmitting}>
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    {loadingRegions.provinces && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kabupaten / Kota</Label>
                <div className="relative">
                    <select {...register("regency")} className={selectClass} disabled={!selectedProvince || loadingRegions.regencies || isSubmitting}>
                        <option value="">-- Pilih Kabupaten/Kota --</option>
                        {regencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                    {loadingRegions.regencies && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kecamatan</Label>
                <div className="relative">
                    <select {...register("district")} className={selectClass} disabled={!selectedRegency || loadingRegions.districts || isSubmitting}>
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    {loadingRegions.districts && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kelurahan / Desa</Label>
                <div className="relative">
                    <select {...register("village")} className={selectClass} disabled={!selectedDistrict || loadingRegions.villages || isSubmitting}>
                        <option value="">-- Pilih Kelurahan/Desa --</option>
                        {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                    {loadingRegions.villages && <Loader2 className="absolute right-3 top-2.5 animate-spin h-4 w-4 text-primary" />}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest ml-1">Kode Pos</Label>
                <Input {...register("postal_code")} placeholder="40123" maxLength={5} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all font-mono" disabled={isSubmitting} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl font-bold">
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 rounded-xl font-bold gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingOrg ? tc("save_changes") : tc("create")}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
};
