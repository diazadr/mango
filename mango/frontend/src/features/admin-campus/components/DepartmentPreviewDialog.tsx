"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { X, Phone, MapPin, Building, User as UserIcon, Mail } from "lucide-react";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";

interface DepartmentPreviewDialogProps {
  department: any;
  onClose: () => void;
}

export const DepartmentPreviewDialog = ({
  department,
  onClose,
}: DepartmentPreviewDialogProps) => {
    const t = useTranslations("DepartmentPreviewDialog");

  if (!department) return null;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_departemen")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("informasi_struktur_dan_kontak_")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <Building className="h-8 w-8 text-primary/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">{department.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge type="status" value={department.is_active !== false ? "active" : "inactive"} />
              {department.organization && (
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider rounded-md border bg-muted text-muted-foreground border-border flex items-center gap-1.5">
                  <Building size={10} />
                  {department.organization.name}
                </span>
              )}
            </div>
            {department.description && (
              <p className="text-sm text-muted-foreground pt-2">
                {department.description}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider">{t("struktur_kontak")}</h4>
          <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("kepala_departemen")}</p>
                <p className="text-sm font-medium text-foreground">{department.head_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("telepon")}</p>
                <p className="text-sm font-medium text-foreground">{department.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("email")}</p>
                <p className="text-sm font-medium text-foreground">{department.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("lokasi_ruangan")}</p>
                <p className="text-sm font-medium text-foreground">{department.location || "—"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminDialog>
  );
};
