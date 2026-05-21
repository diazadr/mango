"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { X, Mail, Phone, Calendar, Building2, Layers } from "lucide-react";
import { AdminDialog, InitialsAvatar } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";

interface AdvisorPreviewDialogProps {
  user: any;
  departments: any[];
  onClose: () => void;
}

export const AdvisorPreviewDialog = ({
  user,
  departments,
  onClose,
}: AdvisorPreviewDialogProps) => {
    const t = useTranslations("AdvisorPreviewDialog");

  if (!user) return null;

  const institution = user.institutions?.[0];
  const departmentId = institution?.department_id;
  const department = departments.find(d => d.id === departmentId);

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_akun_advisor")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("informasi_profil_dan_penugasan")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <span className="text-2xl font-bold text-primary">
              {user.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge type="role" value="advisor" />
              <StatusBadge type="status" value={user.is_active !== false ? "active" : "inactive"} />
            </div>
            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Terdaftar sejak {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider">{t("kontak_akses")}</h4>
          <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("alamat_email")}</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("nomor_telepon")}</p>
                <p className="text-sm font-medium text-foreground">{user.phone || "Tidak ada nomor"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliation Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider">{t("afiliasi_penugasan")}</h4>
          <div className="bg-primary/5 rounded-xl p-4 space-y-4 border border-primary/10">
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("institusi_induk")}</p>
                <p className="text-sm font-medium text-foreground">
                  {institution ? institution.name : "Belum berafiliasi"}
                </p>
              </div>
            </div>

            <div className="h-px bg-primary/10 w-full" />

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("departemen_unit_kerja")}</p>
                {department ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">{department.name}</p>
                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                      {department.head_name && <span>Kepala: {department.head_name}</span>}
                      {department.location && <span>Lokasi: {department.location}</span>}
                      {department.email && <span>Email: {department.email}</span>}
                      {department.phone && <span>Telp: {department.phone}</span>}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">{t("belum_ditugaskan_ke_departemen")}</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminDialog>
  );
};
