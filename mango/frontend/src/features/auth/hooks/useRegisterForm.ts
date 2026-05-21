import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { authService } from "../services/authService";
import { registerSchema, RegisterFormData } from "../schema/registerSchema";

export const useRegisterForm = () => {
  const router = useRouter();
  const t = useTranslations("RegisterPage");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      nik: "",
      dob: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await authService.register(data);
      setRegisterSuccess(true);
    } catch (error: any) {
      console.error("Full Registration error object:", error);
      
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      console.log("Response Status:", status);
      console.log("Response Data:", responseData);

      if (status === 422) {
        if (responseData?.errors) {
          Object.keys(responseData.errors).forEach((key) => {
            const serverMessage = responseData.errors[key][0];
            let messageKey = serverMessage;
            
            // Map common Laravel error messages to translation keys
            const lowerMessage = serverMessage.toLowerCase();
            if (lowerMessage.includes("email has already been taken") || lowerMessage.includes("email sudah ada")) {
                messageKey = "email_taken";
            } else if (lowerMessage.includes("nik has already been taken") || lowerMessage.includes("nik sudah ada")) {
                messageKey = "nik_taken";
            } else if (lowerMessage.includes("greater than 2048 kilobytes") || lowerMessage.includes("lebih besar dari 2048")) {
                messageKey = "avatar_too_large";
            }

            form.setError(key as any, {
              message: messageKey,
            });
          });
        } else {
          setServerError(responseData?.message || "Data yang diberikan tidak valid.");
        }
      } else if (status >= 500) {
        setServerError("Terjadi kesalahan sistem di server. Silakan hubungi admin.");
      } else if (error.code === 'ERR_NETWORK') {
        setServerError("Gagal terhubung ke server. Periksa koneksi internet atau apakah server sedang berjalan.");
      } else {
        setServerError(responseData?.message || "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    registerSuccess,
    serverError,
    t,
  };
};
