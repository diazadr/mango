import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "name_required"),
  legal_entity_type: z.string().min(1, "legal_entity_type_required"),
  npwp: z.string().optional(),
  phone: z.string().min(10, "phone_invalid"),
  address: z.string().min(5, "address_required"),
  province: z.string().min(1, "province_required"),
  regency: z.string().min(1, "regency_required"),
  district: z.string().min(1, "district_required"),
  village: z.string().min(1, "village_required"),
  postal_code: z.string().length(5, "postal_code_invalid").regex(/^\d+$/, "postal_code_numeric"),
  sector: z.string().min(1, "sector_required"),
  nib: z.string().min(1, "nib_required"),
  established_year: z.number({ required_error: "established_year_required", invalid_type_error: "established_year_invalid" }).int().min(1900, "established_year_invalid").max(new Date().getFullYear(), "established_year_invalid"),
  employee_count: z.number({ required_error: "employee_count_required", invalid_type_error: "employee_count_invalid" }).int().min(0, "employee_count_invalid"),
  certifications: z.array(z.string()).optional(),
  umkm_organization_id: z.number().optional().nullable(),
  logo: z.any().optional(),
  nib_file: z.any().refine((file) => file instanceof File || (typeof window !== 'undefined' && file instanceof File), "nib_file_required"),
});

export const businessProfileSchema = z.object({
  main_product: z.string().min(1, "main_product_required"),
  market_target: z.string().min(1, "market_target_required"),
});

export type CompanyFormData = z.infer<typeof companySchema>;
export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;
export type OnboardingData = CompanyFormData & BusinessProfileFormData;
