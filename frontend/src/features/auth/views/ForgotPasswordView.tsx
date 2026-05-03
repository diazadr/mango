"use client";

import React from "react";
import { AlertCircle, ChevronLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useForgotPassword } from "../hooks/useForgotPassword";
import Image from "next/image";

export function ForgotPasswordView() {
  const { form, onSubmit, isLoading, message, error, t } = useForgotPassword();

  return (
    <main className="min-h-screen w-full flex bg-background font-sans text-foreground">
      {/* Hero Section (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary">
        <Image 
          src="/images/login-hero.jpg"
          alt="Manufaktur Industri" 
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold font-heading mb-4">
            Keamanan <span className="text-accent">MANGO</span>
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Pastikan akun Anda tetap aman dengan sistem otentikasi industri yang modern.
          </p>
        </div>
      </div>

      {/* Form Section (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background relative">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-10 group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t("back_to_login")}
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-sm border border-primary/5">
                <Mail size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-3">
              {t("title")}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="success" className="bg-success/5 border-success/20">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success font-medium italic">
                    {message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive font-medium italic">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                {t("email_label")}
              </Label>
              <Input 
                id="email" 
                type="email" 
                {...form.register("email")} 
                disabled={isLoading}
                placeholder={t("email_placeholder")}
                className={`h-12 rounded-xl bg-muted/50 focus-visible:bg-background transition-all ${
                  form.formState.errors.email || error
                    ? "border-destructive focus-visible:ring-destructive" 
                    : "border-input focus-visible:ring-primary"
                }`}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive font-bold mt-1 ml-1">
                    {t(`errors.${form.formState.errors.email.message}`)}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span>Sedang memproses...</span>
                </>
              ) : (
                <span>{t("submit_button")}</span>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-border/50 text-center lg:text-left">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                Sistem ERP MANGO v2.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
