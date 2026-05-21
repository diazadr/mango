"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Store, Check, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { CompanyForm } from "../components/CompanyForm";
import { useOnboarding } from "../hooks/useOnboarding";
import { RegistrationProgressBar } from "../../auth/components/RegistrationProgressBar";

export function OnboardingView() {
  const { logout } = useAuth();
  const { 
    step, 
    setStep, 
    isLoading, 
    isSubmitting, 
    status,
    setStatus,
    organizations,
    companyForm, 
    onCompanySubmit,
    t 
  } = useOnboarding();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="mt-4 text-muted-foreground animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative">
      <div className="absolute top-6 right-6 lg:top-12 lg:right-12">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => logout()}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold transition-all active:scale-95"
        >
          <LogOut size={16} className="mr-2" />
          Keluar
        </Button>
      </div>

      <RegistrationProgressBar currentStep={3} />

      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-primary/10 mb-6 shadow-sm border border-primary/5">
            <Store size={32} className="text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">{t("data_bisnis_umkm")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("langkah_terakhir_untuk_mengaktifkan_selu")}</p>
        </div>

        <div className="bg-card rounded-[2rem] shadow-sm border border-border/50 p-8 md:p-12">
          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Alert variant={status.type === "success" ? "success" : "destructive" as any} className="rounded-2xl">
                  {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription className="flex items-center justify-between">
                    {status.message}
                    <button onClick={() => setStatus(null)} className="ml-4 text-xs font-bold tracking-wide opacity-70 hover:opacity-100">
                      Tutup
                    </button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-foreground leading-tight">{t("registrasi_identitas_bisnis")}</h2>
                      <p className="text-muted-foreground text-sm">{t("lengkapi_data_dasar_mengenai_badan_usaha")}</p>
                  </div>
              </div>
              <CompanyForm 
                form={companyForm} 
                onSubmit={onCompanySubmit} 
                isSubmitting={isSubmitting} 
                organizations={organizations}
                t={t} 
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
