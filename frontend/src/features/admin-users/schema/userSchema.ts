import { z } from "zod";

export const userAdminSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  phone: z.string().optional(),
  password: z.string().optional(),
  role: z.string().min(1, "role_required"),
  institution_id: z.number().optional(),
  organization_id: z.number().optional(),
});

export type UserAdminFormData = z.infer<typeof userAdminSchema>;
