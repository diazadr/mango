import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { authService } from "../services/authService";
import { useAuth } from "@/src/components/providers/AuthProvider";

export const useVerifyEmail = () => {
  const router = useRouter();
  const t = useTranslations("VerifyEmailPage");
  const { user, refreshUser, logout, isLoading: isAuthLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check status immediately
    if (user?.email_verified_at) {
      if (user.roles?.includes("umkm") && !user.umkm) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard?login=success");
      }
      return;
    }

    // Polling with explicit user check
    const interval = setInterval(async () => {
       const updatedUser = await refreshUser() as any;
       if (updatedUser?.email_verified_at) {
          if (updatedUser.roles?.includes("umkm") && !updatedUser.umkm) {
            router.replace("/onboarding");
          } else {
            router.replace("/dashboard?login=success");
          }
       }
    }, 4000);

    return () => clearInterval(interval);
  }, [user?.email_verified_at, user?.roles, user?.umkm, router, refreshUser]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      await authService.resendVerification();
      setStatus("verification-link-sent");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleResendVerification,
    handleLogout: logout,
    isLoading,
    isAuthLoading,
    status,
    t,
  };
};
