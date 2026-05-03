import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "name_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  password: z.string()
    .min(8, "password_min_8")
    .regex(/[A-Z]/, "password_uppercase")
    .regex(/[a-z]/, "password_lowercase")
    .regex(/[0-9]/, "password_number")
    .regex(/[^A-Za-z0-9]/, "password_special"),
  password_confirmation: z.string().min(1, "password_confirmation_required"),
  nik: z.string().length(16, "nik_invalid_length").regex(/^\d+$/, "nik_numeric"),
  dob: z.string().min(1, "dob_required"),
  avatar: z.any()
    .optional()
    .refine((file) => !file || (file instanceof File && file.size <= 2 * 1024 * 1024), "avatar_too_large"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "password_mismatch",
  path: ["password_confirmation"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
