import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { authService } from "../services/authService";
import { loginSchema, LoginFormData } from "../schema/loginSchema";

export const useLoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations("LoginPage");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Force clear session remnants on mount
    localStorage.removeItem("user");
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await authService.login(data);
      const user = await login(); // Update auth state and get user data
      
      router.refresh();

      // Check if email is verified
      if (user && !user.email_verified_at) {
          router.push(`/${locale}/verify-email`);
      } else {
          router.push(`/${locale}/dashboard?login=success`);
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      
      if (responseData?.errors) {
        const errors = responseData.errors;
        // Check for common Fortify error messages
        const firstKey = Object.keys(errors)[0];
        const firstError = errors[firstKey][0];
        
        if (firstError === "These credentials do not match our records.") {
            setServerError(t("errors.wrong_credentials"));
        } else {
            setServerError(firstError);
        }
      } else {
        setServerError(t("errors.server_error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    serverError,
    t,
  };
};
