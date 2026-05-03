"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Link } from "@/src/i18n/navigation";
import { useLoginForm } from "../hooks/useLoginForm";
import { useAuth } from "@/src/components/providers/AuthProvider";
import Image from "next/image";

export function LoginView() {
  const { form, onSubmit, isLoading, serverError, t } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const logoutSuccess = searchParams.get("logout") === "success";
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <main className="min-h-screen w-full flex bg-background font-sans text-foreground relative">
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
          >
            <ArrowLeft size={16} className="mr-2" />
            Beranda
          </Button>
        </Link>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary overflow-hidden">
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
            {t.rich("hero_title", {
              accent: (chunks) => (
                <span className="text-accent">{chunks}</span>
              ),
            })}
          </h2>

          <p className="text-lg text-white/90 leading-relaxed">
            {t("hero_desc")}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:py-16 bg-background relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">
              {t("title")}
            </h1>

            <p className="text-muted-foreground">
              {t.rich("subtitle", {
                accent: (chunks) => (
                  <span className="text-accent font-semibold">{chunks}</span>
                ),
              })}
            </p>
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="rounded-xl border-destructive/20 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />

                  <AlertDescription className="text-sm font-medium text-destructive">
                    {serverError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {logoutSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="rounded-xl border-green-500/20 bg-green-500/5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  <AlertDescription className="text-sm font-medium">
                    {t("logout_success")}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {resetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert className="rounded-xl border-green-500/20 bg-green-500/5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />

                  <AlertDescription className="text-sm font-medium">
                    Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("email_label")}
              </Label>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail size={18} strokeWidth={1.5} />
                </div>

                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder={t("email_placeholder")}
                  disabled={isLoading}
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
                />
              </div>

              {form.formState.errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {t(`errors.${form.formState.errors.email.message}`)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {t("password_label")}
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  {t("forgot_password")}
                </Link>
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock size={18} strokeWidth={1.5} />
                </div>

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pl-10 pr-12 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {form.formState.errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {t(`errors.${form.formState.errors.password.message}`)}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span>{t("processing")}</span>
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t("submit_button")}
                  <ArrowRight size={18} strokeWidth={2.2} />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("no_account")}{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:text-accent underline underline-offset-4"
            >
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}