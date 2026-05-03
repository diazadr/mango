"use client";

import React, { useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Save, Lock, Mail, Phone, User as UserIcon, Camera, Loader2, Calendar } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { ProfileFormData, PasswordFormData } from "../schema/profileSchema";

interface ProfileFormProps {
  form: UseFormReturn<ProfileFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  user: any;
  t: any;
}

export const ProfileForm = ({ form, onSubmit, isSubmitting, user, t }: ProfileFormProps) => {
  const { register, formState: { errors }, setValue } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.avatar_url && !user.avatar_url.includes('placeholders') ? user.avatar_url : null
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar" as any, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
         <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-28 h-28 bg-white p-1.5 rounded-[2rem] shadow-lg border-2 border-primary/10 transition-all group-hover:border-primary">
                <Avatar className="h-full w-full rounded-[1.75rem]">
                    <AvatarImage src={previewUrl || null} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="absolute inset-1.5 flex items-center justify-center bg-black/40 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white h-8 w-8" />
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
         </div>
         <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">{t("click_to_change_avatar") || "Klik untuk ganti foto"}</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-muted-foreground ml-1">{t("full_name")}</Label>
            <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input id="name" {...register("name")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" disabled={isSubmitting} />
            </div>
            {errors.name && <p className="text-xs font-medium text-destructive ml-1">{t(`errors.${errors.name.message}`)}</p>}
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-muted-foreground ml-1">{t("email_address")}</Label>
            <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" {...register("email")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" disabled={isSubmitting} />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground/70 ml-1 italic">
                Catatan: Mengubah email akan membuat akun Anda memerlukan verifikasi ulang.
            </p>
            {errors.email && <p className="text-xs font-medium text-destructive ml-1">{t(`errors.${errors.email.message}`)}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground ml-1">{t("phone_number")}</Label>
            <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input id="phone" {...register("phone")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" disabled={isSubmitting} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="nik" className="text-xs font-bold text-muted-foreground ml-1">{t("nik_label") || "Nomor Induk Kependudukan (NIK)"}</Label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input id="nik" {...register("nik")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold font-mono" placeholder="16 digit NIK" disabled={isSubmitting} maxLength={16} />
                </div>
                {errors.nik && <p className="text-xs font-medium text-destructive ml-1">{t(`errors.${errors.nik.message}`)}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs font-bold text-muted-foreground ml-1">{t("dob_label") || "Tanggal lahir"}</Label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input id="dob" type="date" {...register("dob")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" disabled={isSubmitting} />
                </div>
                {errors.dob && <p className="text-xs font-medium text-destructive ml-1">{t(`errors.${errors.dob.message}`)}</p>}
            </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20">
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {isSubmitting ? t("saving") : t("save_changes")}
        </Button>
      </div>
    </form>
  );
};

interface PasswordFormProps {
  form: UseFormReturn<PasswordFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  t: any;
}

export const PasswordForm = ({ form, onSubmit, isSubmitting, t }: PasswordFormProps) => {
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="current_password" className="text-xs font-bold text-muted-foreground ml-1">{t("current_password")}</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input id="current_password" type="password" {...register("current_password")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
          </div>
          {errors.current_password && <p className="text-xs font-medium text-destructive ml-1">{errors.current_password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold text-muted-foreground ml-1">{t("new_password")}</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" {...register("password")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
          </div>
          {errors.password && <p className="text-xs font-medium text-destructive ml-1">{t(`errors.${errors.password.message}`)}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-xs font-bold text-muted-foreground ml-1">{t("confirm_password")}</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input id="password_confirmation" type="password" {...register("password_confirmation")} className="pl-12 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
          </div>
          {errors.password_confirmation && <p className="text-xs font-medium text-destructive ml-1">{errors.password_confirmation.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" variant="destructive" disabled={isSubmitting} className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-destructive/20">
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
          {isSubmitting ? t("updating") : t("update_password")}
        </Button>
      </div>
    </form>
  );
};
