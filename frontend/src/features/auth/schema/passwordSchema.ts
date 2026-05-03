import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "token_required"),
  email: z.string().min(1, "email_required").email("email_invalid"),
  password: z.string()
    .min(8, "password_min_8")
    .regex(/[A-Z]/, "password_uppercase")
    .regex(/[a-z]/, "password_lowercase")
    .regex(/[0-9]/, "password_number")
    .regex(/[^A-Za-z0-9]/, "password_special"),
  password_confirmation: z.string().min(1, "password_confirmation_required"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "password_mismatch",
  path: ["password_confirmation"],
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
