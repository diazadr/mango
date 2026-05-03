import { z } from "zod";

export const umkmOrganizationSchema = z.object({
  upt_id: z.coerce.number({ required_error: "UPT pembina wajib dipilih" }).min(1, "UPT pembina wajib dipilih"),
  name: z.string().min(3, "Nama organisasi minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  postal_code: z.string().max(10, "Kode pos maksimal 10 karakter").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type UmkmOrganizationFormData = z.infer<typeof umkmOrganizationSchema>;
