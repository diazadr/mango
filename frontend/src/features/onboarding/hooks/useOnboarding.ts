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
      umkm_organization_id: 0,
    },
  });

  const businessProfileForm = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      main_product: "",
      market_target: "",
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
              companyForm.reset({
                name: user.umkm.name || "",
                legal_entity_type: user.umkm.legal_entity_type || "Perseorangan",
                npwp: user.umkm.npwp || "",
                phone: user.umkm.phone || user.phone || "",
                address: user.umkm.address || "",
                province: user.umkm.province || "",
                regency: user.umkm.regency || "",
                district: user.umkm.district || "",
                village: user.umkm.village || "",
                postal_code: user.umkm.postal_code || "",
                sector: user.umkm.sector || "Manufaktur",
                nib: user.umkm.nib || "",
                established_year: user.umkm.established_year || undefined,
                employee_count: user.umkm.employee_count ?? undefined,
                umkm_organization_id: user.umkm.umkm_organization_id || 0,
              });

              if (user.umkm.profile) {
                businessProfileForm.reset({
                  main_product: user.umkm.profile.main_product || "",
                  market_target: user.umkm.profile.market_target || "",
                });
                
                // If everything is completed, redirect to dashboard
                router.push("/dashboard");
                return;
              } else {
                setStep(2);
              }
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
  }, [router, companyForm, businessProfileForm]);

  const onCompanySubmit = async (data: CompanyFormData) => {
    setStep1Data(data);
    setStep(2);
    setStatus(null);
  };

  const onBusinessProfileSubmit = async (data: BusinessProfileFormData) => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      const currentStep1Data = step1Data || companyForm.getValues();
      
      const fullData = {
        ...currentStep1Data,
        ...data
      };

      if (user?.umkm) {
        // If UMKM exists but profile doesn't (or updating), use update and profile submit
        await onboardingService.updateUmkm(user.umkm.id, currentStep1Data);
        await onboardingService.submitBusinessProfile(data);
      } else {
        // New registration
        await onboardingService.submitCompany(fullData as any);
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
    businessProfileForm,
    onCompanySubmit: companyForm.handleSubmit(onCompanySubmit),
    onBusinessProfileSubmit: businessProfileForm.handleSubmit(onBusinessProfileSubmit),
    t,
  };
};
