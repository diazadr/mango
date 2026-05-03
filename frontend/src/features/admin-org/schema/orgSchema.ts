import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "name_required"),
  pic_name: z.string().optional(),
  pic_phone: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["kampus", "upt"], "type_required"),
  email: z.string().email("email_invalid").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  regency: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  postal_code: z.string().optional(),
  logo: z.any().optional(),
  is_active: z.boolean().optional(),
});

export const departmentSchema = z.object({
  institution_id: z.number().min(1, "organization_required"),
  name: z.string().min(1, "name_required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
