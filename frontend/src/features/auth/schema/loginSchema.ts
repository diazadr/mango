import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "email_required").email("email_invalid"),
  password: z.string().min(1, "password_required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
