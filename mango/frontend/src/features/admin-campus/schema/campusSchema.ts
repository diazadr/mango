import { z } from "zod";

export const campusSchema = z.object({
  name: z.string().min(1, "name_required"),
  pic_name: z.string().optional(),
  pic_phone: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("email_invalid").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  regency: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  logo: z.any().optional(),
});

export type CampusFormData = z.infer<typeof campusSchema>;
