import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { onboardingService } from "../services/onboardingService";
import { 
  companySchema, 
  businessProfileSchema, 
  CompanyFormData, 
  BusinessProfileFormData 
} from "../schema/onboardingSchema";

export const useOnboarding = () => {
  const router = useRouter();
  const { refreshUser, user } = useAuth();
  const t = useTranslations("OnboardingPage");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  // Store step 1 data to be submitted with step 2
  const [step1Data, setStep1Data] = useState<CompanyFormData | null>(null);

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      legal_entity_type: "Perseorangan",
      npwp: "",
      phone: user?.phone || "",
      address: "",
      province: "",
      regency: "",
      district: "",
      village: "",
      postal_code: "",
      sector: "Manufaktur",
      nib: "",
      established_year: undefined,
      employee_count: undefined,
      organization_id: 0,
    },
  });

  const businessProfileForm = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
    },
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [statusRes, orgsRes] = await Promise.all([
                onboardingService.getUserOnboardingStatus(),
                onboardingService.getOrganizations()
            ]);

            setOrganizations(orgsRes.data.data || []);

            const data = statusRes.data.data;
            const user = data?.user || statusRes.data.user || statusRes.data;
            
            if (!user || !user.email_verified_at) {
              router.push("/verify-email");
              return;
            }

            if (user.umkm) {
              // If UMKM already exists, they have completed the registration step
              router.push("/dashboard");
              return;
            } else {
                if (user.phone) companyForm.setValue("phone", user.phone);
            }
        } catch (err) {
            console.error("Onboarding fetch error:", err);
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [router, companyForm]);

  const onCompanySubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      if (user?.umkm) {
        await onboardingService.updateUmkm(user.umkm.id, data);
      } else {
        await onboardingService.submitCompany(data as any);
      }

      await refreshUser();
      
      setStatus({ type: "success", message: "Onboarding completed!" });
      const locale = window.location.pathname.split("/")[1];
      window.location.href = `/${locale}/dashboard`;
    } catch (error: any) {
      const errorData = error.response?.data;
      let message = errorData?.message || t("errors.server_error") || "Error completing onboarding";
      
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0] as string[];
        if (firstError) message = firstError[0];
      }

      setStatus({ type: "destructive", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    isLoading,
    isSubmitting,
    organizations,
    status,
    setStatus,
    companyForm,
    onCompanySubmit: companyForm.handleSubmit(onCompanySubmit),
    t,
  };
};
