import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { authService } from "../services/authService";
import { resetPasswordSchema, ResetPasswordFormData } from "../schema/passwordSchema";

export const useResetPassword = (token: string, email: string) => {
  const router = useRouter();
  const t = useTranslations("ResetPasswordPage");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log("Submitting reset password data:", data);
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(data);
      router.push("/login?reset=success");
    } catch (err: any) {
      const responseData = err.response?.data;
      console.error("Reset password error response:", responseData);
      
      if (responseData?.errors?.email) {
          setError("Tautan reset password sudah kedaluwarsa atau tidak valid. Silakan minta tautan baru.");
      } else {
          setError(responseData?.message || "Gagal memperbarui kata sandi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    error,
    t,
  };
};
