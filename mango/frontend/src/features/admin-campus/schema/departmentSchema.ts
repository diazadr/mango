import { z } from "zod";

export const departmentSchema = z.object({
  institution_id: z.number().min(1, "organization_required"),
  name: z.string().min(1, "name_required"),
  description: z.string().optional(),
  email: z.string().email("email_invalid").or(z.literal("")).optional(),
  phone: z.string().optional(),
  head_name: z.string().optional(),
  location: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
