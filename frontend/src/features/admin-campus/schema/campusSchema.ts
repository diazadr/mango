import { z } from "zod";

export const campusSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
});

export type CampusFormData = z.infer<typeof campusSchema>;
