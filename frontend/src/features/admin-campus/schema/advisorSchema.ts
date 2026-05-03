import { z } from "zod";

export const advisorSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  phone: z.string().optional(),
  password: z.string().optional(),
  institution_id: z.number().optional(),
  organization_id: z.number().optional(),
  role: z.string().optional(),
});

export type AdvisorFormData = z.infer<typeof advisorSchema>;
