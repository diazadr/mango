"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { UserAdminFormData } from "../schema/userSchema";

interface UserDialogFormProps {
  form: UseFormReturn<UserAdminFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
  editingUser: any;
  t: any;
  tc: any;
}

export const UserDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  onClose,
  editingUser,
  t,
  tc,
}: UserDialogFormProps) => {
  const { register, formState: { errors } } = form;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{editingUser ? t("modal_edit_title") : t("modal_create_title")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {editingUser ? t("modal_edit_desc") : t("modal_create_desc")}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("label_name")}</Label>
            <Input 
              {...register("name")} 
              placeholder={t("placeholder_name")} 
              className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" 
              disabled={isSubmitting} 
            />
            {errors.name && <p className="text-xs text-destructive">{t(`errors.${errors.name.message}`)}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("label_email")}</Label>
              <Input 
                {...register("email")} 
                type="email" 
                placeholder={t("placeholder_email")} 
                className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" 
                disabled={isSubmitting} 
              />
              {errors.email && <p className="text-xs text-destructive">{t(`errors.${errors.email.message}`)}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("label_phone")}</Label>
              <Input 
                {...register("phone")} 
                placeholder={t("placeholder_phone")} 
                className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" 
                disabled={isSubmitting} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("label_role")}</Label>
              <select 
                {...register("role")}
                className="flex h-10 w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              >
                <option value="umkm">{t("role_umkm")}</option>
                <option value="advisor">{t("role_advisor")}</option>
                <option value="admin">{t("role_admin")}</option>
                <option value="super_admin">{t("role_super_admin")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {editingUser ? t("label_password_optional") : t("label_password")}
              </Label>
              <Input 
                {...register("password")} 
                type="password" 
                placeholder="••••••••" 
                className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" 
                disabled={isSubmitting} 
              />
              {errors.password && <p className="text-xs text-destructive">{t(`errors.${errors.password.message}`)}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 rounded-lg">
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 rounded-lg gap-2">
            {isSubmitting ? <Save className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {editingUser ? tc("save_changes") : tc("create")}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
};
