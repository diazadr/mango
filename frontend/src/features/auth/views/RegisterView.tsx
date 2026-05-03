"use client";

import React, { useRef, useState } from "react";
import { Link } from "@/src/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Camera,
  Upload,
  AlertCircle,
  Hash,
  Calendar,
  FileCheck,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/src/components/ui/dialog";
import { RegistrationProgressBar } from "../components/RegistrationProgressBar";
import { useRouter } from "@/src/i18n/navigation";
import { useEffect } from "react";

import { Checkbox } from "@/src/components/ui/checkbox";

export const RegisterView = () => {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const { form, onSubmit, isLoading, registerSuccess, serverError, t } = useRegisterForm();
  const {
    register,
    formState: { errors },
    setValue,
  } = form;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (registerSuccess) {
        // Redirect to onboarding (middleware will handle verification check)
        router.push("/onboarding");
    }
  }, [registerSuccess, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-background font-sans text-foreground overflow-y-auto py-12 px-6 sm:px-12 relative">
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

      <RegistrationProgressBar currentStep={1} />

      <div className="w-full max-w-md my-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">
            Data Diri & Akun
          </h1>
          <p className="text-muted-foreground text-sm">
            Lengkapi identitas pribadi dan detail akses akun Anda.
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
                <AlertDescription className="text-sm font-medium text-destructive">
                  {serverError}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                {t("profile_picture_label")}
                </Label>

                <div
                onClick={handleAvatarClick}
                className={`relative group cursor-pointer border rounded-2xl transition-all flex flex-col items-center justify-center h-28 w-28 shadow-sm hover:shadow-md ${
                    previewUrl
                    ? "border-primary/40 bg-background"
                    : "border-border hover:border-primary/40 bg-muted/20"
                }`}
                >
                {previewUrl ? (
                    <>
                    <img src={previewUrl} alt="Preview" className="h-full w-full rounded-[14px] object-cover" />
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-full shadow-lg border-2 border-white">
                        <Camera size={12} />
                    </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Upload size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-foreground">{t("upload_label")}</p>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {/* Personal Info */}
                <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">{t("name_label")}</Label>
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <User size={18} strokeWidth={1.5} />
                    </div>
                    <Input {...register("name")} placeholder={t("name_placeholder")} className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background" />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.name.message}`)}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">NIK (16 Digit)</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Hash size={18} strokeWidth={1.5} />
                        </div>
                        <Input {...register("nik")} placeholder="NIK sesuai KTP" className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background font-mono" maxLength={16} />
                    </div>
                    {errors.nik && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.nik.message}`)}</p>}
                    </div>

                    <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Lahir</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Calendar size={18} strokeWidth={1.5} />
                        </div>
                        <Input type="date" {...register("dob")} className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background" />
                    </div>
                    {errors.dob && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.dob.message}`)}</p>}
                    </div>
                </div>

                {/* Account Info */}
                <div className="pt-4 border-t border-dashed border-border/50 space-y-5">
                    <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">{t("email_label")}</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail size={18} strokeWidth={1.5} />
                        </div>
                        <Input type="email" {...register("email")} placeholder={t("email_placeholder")} className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background" />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.email.message}`)}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">{t("password_label")}</Label>
                        <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <Input type="password" {...register("password")} placeholder="••••••••" className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">{t("password_confirmation_label")}</Label>
                        <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock size={18} strokeWidth={1.5} />
                        </div>
                        <Input type="password" {...register("password_confirmation")} placeholder="••••••••" className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background" />
                        </div>
                    </div>
                    </div>
                    {(errors.password || errors.password_confirmation) && (
                    <p className="text-[10px] font-bold text-destructive ml-1">{t(`errors.${errors.password?.message || errors.password_confirmation?.message}`)}</p>
                    )}
                </div>
            </div>

            {/* Terms & Privacy Section */}
            <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10 transition-all hover:bg-primary/[0.08]">
                <div className="pt-0.5">
                    <Checkbox 
                        id="terms" 
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                </div>
                <div className="flex-1">
                    <Label 
                        htmlFor="terms" 
                        className="text-[11px] leading-relaxed text-muted-foreground font-medium cursor-pointer select-none block"
                    >
                        Saya memahami dan menyetujui <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-primary font-bold hover:underline">Syarat & Ketentuan</button> serta <button type="button" onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }} className="text-primary font-bold hover:underline">Kebijakan Privasi</button> yang ditetapkan oleh platform MANGO.
                    </Label>
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading || !termsAccepted} 
                className="w-full h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 text-white flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : (
                    <>
                        Daftar Akun
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {t("already_have_account")}{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:text-accent underline underline-offset-4"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>

      {/* Terms & Privacy Modals (Omitted for brevity, but I will include them or keep them) */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <FileCheck className="text-primary" /> Syarat & Ketentuan
                </DialogTitle>
                <DialogDescription>Harap baca dengan teliti syarat dan ketentuan penggunaan platform MANGO.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed py-4">
                <p>MANGO adalah platform digital POLMAN Bandung untuk transformasi IKM manufaktur.</p>
                <p>Pengguna wajib memberikan data akurat untuk profil pribadi dan UMKM.</p>
            </div>
            <DialogFooter><Button onClick={() => setShowTerms(false)} className="rounded-xl font-bold bg-primary px-8">Saya Mengerti</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Shield className="text-primary" /> Kebijakan Privasi
                </DialogTitle>
                <DialogDescription>Komitmen kami dalam melindungi data pribadi dan bisnis Anda.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed py-4">
                <p>Kami mengumpulkan NIK dan Nama untuk verifikasi identitas resmi platform.</p>
            </div>
            <DialogFooter><Button onClick={() => setShowPrivacy(false)} className="rounded-xl font-bold bg-primary px-8">Saya Mengerti</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
