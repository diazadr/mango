"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Save, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { departmentSchema, DepartmentFormData } from "../schema/departmentSchema";

interface DeptDialogFormProps {
  form: UseFormReturn<DepartmentFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
  editingDept: any;
  campus: any;
}

export const DeptDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  onClose,
  editingDept,
  campus,
}: DeptDialogFormProps) => {
  const { register, formState: { errors } } = form;
  const t = useTranslations("DepartmentView");
  const tc = useTranslations("DashboardCommon");

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{editingDept ? t("edit_title") : t("add")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {editingDept ? "Perbarui data unit kerja" : "Tambahkan unit baru ke institusi"}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("institusi_induk")}</Label>
            <Input value={campus?.name || "Memuat..."} disabled className="h-10 rounded-lg bg-muted/50 border-transparent font-medium" />
            <input type="hidden" {...register("institution_id", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("nama_unit_departemen")}</Label>
            <Input {...register("name")} placeholder={t("placeholder_misal_teknik_tekstil")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("deskripsi_spesialisasi")}</Label>
            <Input {...register("description")} placeholder={t("placeholder_fokus_bidang_keahlian_unit_ini")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("kepala_departemen")}</Label>
              <Input {...register("head_name")} placeholder={t("placeholder_nama_kepala_departemen")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("lokasi_gedung_ruangan")}</Label>
              <Input {...register("location")} placeholder={t("placeholder_misal_gedung_a_lt_2")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("email_unit")}</Label>
              <Input {...register("email")} type="email" placeholder={t("placeholder_emailinstitusiacid")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("no_telepon_unit")}</Label>
              <Input {...register("phone")} placeholder={t("placeholder_nomor_kontak_departemen")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("status_operasional")}</Label>
            <select 
                {...register("is_active", { setValueAs: (v) => v === "true" })}
                className="flex h-10 w-full rounded-lg border-transparent bg-muted/30 px-3 py-2 text-sm focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
            >
                <option value="true">{t("aktif")}</option>
                <option value="false">{t("nonaktif")}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 rounded-lg">
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 rounded-lg gap-2">
            {isSubmitting ? <Save className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {editingDept ? tc("save_changes") : tc("create")}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
};
