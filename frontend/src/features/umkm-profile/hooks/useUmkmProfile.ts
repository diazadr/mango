import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { onboardingService } from "../../onboarding/services/onboardingService";
import { z } from "zod";

// Dedicated Update Schema
const dayScheduleSchema = z.object({
    open: z.string().optional().nullable(),
    close: z.string().optional().nullable(),
    closed: z.boolean().optional().nullable(),
});

const operatingHoursSchema = z.object({
    monday: dayScheduleSchema.optional(),
    tuesday: dayScheduleSchema.optional(),
    wednesday: dayScheduleSchema.optional(),
    thursday: dayScheduleSchema.optional(),
    friday: dayScheduleSchema.optional(),
    saturday: dayScheduleSchema.optional(),
    sunday: dayScheduleSchema.optional(),
});

const umkmUpdateSchema = z.object({
    name: z.string().min(1, "name_required"),
    description: z.string().optional().nullable(),
    sector: z.string().min(1, "sector_required"),
    email: z.string().email("email_invalid").optional().nullable(),
    phone: z.string().min(1, "phone_invalid"),
    address: z.string().min(1, "address_required"),
    province: z.string().min(1, "province_required"),
    regency: z.string().min(1, "regency_required"),
    district: z.string().min(1, "district_required"),
    village: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    
    website: z.string().optional().nullable(),
    latitude: z.any().optional().nullable(),
    longitude: z.any().optional().nullable(),
    
    established_year: z.any().optional(),
    employee_count: z.any().optional(),
    organization_id: z.any().optional().nullable(),
    
    main_product: z.string().optional().nullable(),
    market_target: z.string().optional().nullable(),
    operating_hours: operatingHoursSchema.optional().nullable(),
    
    logo: z.any().optional(), // Added logo to schema
    nib: z.any().optional(),
});

const DEFAULT_HOURS = {
    monday: { open: "08:00", close: "17:00", closed: false },
    tuesday: { open: "08:00", close: "17:00", closed: false },
    wednesday: { open: "08:00", close: "17:00", closed: false },
    thursday: { open: "08:00", close: "17:00", closed: false },
    friday: { open: "08:00", close: "17:00", closed: false },
    saturday: { open: "08:00", close: "12:00", closed: true },
    sunday: { open: "08:00", close: "12:00", closed: true },
};

export const useUmkmProfile = () => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(umkmUpdateSchema),
    defaultValues: {
      name: "",
      description: "",
      legal_entity_type: "Perseorangan",
      organization_id: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      province: "",
      regency: "",
      district: "",
      village: "",
      postal_code: "",
      latitude: "",
      longitude: "",
      sector: "",
      nib: "",
      established_year: new Date().getFullYear(),
      employee_count: 0,
      vision: "",
      mission: "",
      main_product: "",
      market_target: "",
      operating_hours: DEFAULT_HOURS,
      logo: null,
    },
  });

  const fetchOrgs = useCallback(async () => {
    try {
        const res = await onboardingService.getOrganizations();
        setOrganizations(res.data.data || []);
    } catch (err) {
        console.error("Failed to fetch orgs", err);
    }
  }, []);

  useEffect(() => {
    if (user?.umkm) {
      form.reset({
        name: user.umkm.name || "",
        description: user.umkm.description || "",
        legal_entity_type: user.umkm.legal_entity_type || "Perseorangan",
        organization_id: user.umkm.organization_id?.toString() || "",
        email: user.umkm.email || "",
        phone: user.umkm.phone || "",
        website: user.umkm.website || "",
        address: user.umkm.address || "",
        province: user.umkm.province || "",
        regency: user.umkm.regency || "",
        district: user.umkm.district || "",
        village: user.umkm.village || "",
        postal_code: user.umkm.postal_code || "",
        latitude: user.umkm.latitude?.toString() || "",
        longitude: user.umkm.longitude?.toString() || "",
        sector: user.umkm.sector || "",
        nib: user.umkm.nib || "",
        established_year: user.umkm.established_year || new Date().getFullYear(),
        employee_count: user.umkm.employee_count || 0,
        main_product: user.umkm.profile?.main_product || "",
        market_target: user.umkm.profile?.market_target || "",
        operating_hours: user.umkm.operating_hours || DEFAULT_HOURS,
        logo: null,
      });
    }
    fetchOrgs();
  }, [user, form, fetchOrgs]);

  const onSubmit = async (data: any) => {
    if (!user?.umkm?.uuid) return;
    
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null) {
            if (typeof value === 'boolean') {
                formData.append(key, value ? "1" : "0");
            } else if (key === "operating_hours") {
                formData.append(key, JSON.stringify(value));
            } else if (key === "certifications" && Array.isArray(value)) {
                value.forEach((v, index) => formData.append(`${key}[${index}]`, v));
            } else if (value instanceof File) {
                formData.append(key, value);
            } else if (value === "" && ["nik", "nib", "latitude", "longitude", "village"].includes(key)) {
                // Skip empty strings
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    try {
      await onboardingService.updateUmkm(user.umkm.uuid, formData);
      await refreshUser();
      setStatus({ type: "success", message: "Profil UMKM berhasil diperbarui!" });
    } catch (error: any) {
      console.log("FULL ERROR OBJECT:", JSON.stringify(error.response?.data, null, 2));
      
      let errorMsg = "Gagal memperbarui profil.";
      const responseData = error.response?.data;
      
      if (responseData?.errors) {
        console.table(responseData.errors);
        const firstErrorKey = Object.keys(responseData.errors)[0];
        const firstError = responseData.errors[firstErrorKey];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError.toString();
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      }
      
      setStatus({ type: "destructive", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    status,
    setStatus,
    organizations,
    user,
    refreshUser
  };
};
