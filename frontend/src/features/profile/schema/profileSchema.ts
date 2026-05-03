import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  phone: z.string().optional(),
  nik: z.string().length(16, "nik_invalid_length").regex(/^\d+$/, "nik_numeric").optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  avatar: z.any().optional(),
});

export const passwordSchema = z.object({
  current_password: z.string().min(1, "current_password_required"),
  password: z.string().min(8, "password_min_8"),
  password_confirmation: z.string().min(1, "password_confirmation_required"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "password_mismatch",
  path: ["password_confirmation"],
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
