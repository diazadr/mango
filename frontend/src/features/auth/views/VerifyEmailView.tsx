"use client";

import React from "react";
import { Mail, Loader2, LogOut, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { RegistrationProgressBar } from "../components/RegistrationProgressBar";
import { useRouter } from "@/src/i18n/navigation";

export function VerifyEmailView() {
  const router = useRouter();
  const { handleResendVerification, handleLogout, isLoading, isAuthLoading, status, t, user } = useVerifyEmail() as any;

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const checkStatus = () => {
    // Force refresh the page to trigger middleware/auth check
    window.location.reload();
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-background font-sans text-foreground overflow-y-auto py-12 px-6 sm:px-12">
      <RegistrationProgressBar currentStep={2} />

      <div className="w-full max-w-md my-auto">
        <div className="mb-10 text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={40} className="text-primary" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-3">
              Verifikasi Email
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kami telah mengirimkan link verifikasi ke <span className="font-bold text-foreground">{user?.email}</span>. 
              Silakan klik link tersebut untuk mengaktifkan akun dan melanjutkan ke pengisian data UMKM.
            </p>
        </div>

        <AnimatePresence>
            {status === "verification-link-sent" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="success" className="bg-success/5 border-success/20 rounded-2xl">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success font-medium">
                    Tautan verifikasi baru telah dikirim!
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="space-y-6">
            <div className="bg-muted/30 p-5 rounded-2xl text-left border border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" /> Apa langkah selanjutnya?
                </h4>
                <ul className="text-[11px] text-muted-foreground space-y-2 ml-5 list-disc font-medium">
                    <li>Cek kotak masuk atau folder spam email Anda.</li>
                    <li>Klik tombol "Verifikasi Alamat Email" di dalam pesan tersebut.</li>
                    <li>Kembali ke halaman ini dan klik tombol periksa status di bawah.</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Button
                    onClick={checkStatus}
                    className="h-12 w-full rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} />
                    <span>Saya Sudah Verifikasi</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-primary/20 text-primary font-bold hover:bg-primary/5"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Kirim Ulang Email"}
                </Button>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive"
            >
              <LogOut size={16} />
              <span>Keluar Akun</span>
            </button>
        </div>
      </div>
    </main>
  );
}
