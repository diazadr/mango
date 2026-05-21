"use client";

import React from "react";
import { X, Mail, Phone, Calendar, Building2, Briefcase } from "lucide-react";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { useTranslations } from "next-intl";

interface UserPreviewDialogProps {
  user: any;
  onClose: () => void;
  t?: any;
  tc?: any;
}

export const UserPreviewDialog = ({
  user,
  onClose,
}: UserPreviewDialogProps) => {
  const t = useTranslations("UserPreviewDialog");

  if (!user) return null;

  const role = user.roles?.[0]?.name || "umkm";
  const institution = user.institutions?.[0] || null;
  const organization = user.organizations?.[0] || null;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_akun_pengguna")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("informasi_profil_dan_penugasan")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-[1rem] overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.avatar_url && !user.avatar_url.includes("placeholders") ? (
              <img
                src={user.avatar_large || user.avatar_url}
                alt={user.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {user.name?.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge type="role" value={role} />
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
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t("kontak_akses")}</h4>
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
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{t("afiliasi_penugasan")}</h4>
          <div className="bg-primary/5 rounded-xl p-4 space-y-4 border border-primary/10">

            {(institution || organization) ? (
              <>
                {institution && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm border border-primary/20 overflow-hidden flex-shrink-0">
                      {institution.logo_url && !institution.logo_url.includes("placeholders") ? (
                        <img src={institution.logo_url} alt={institution.name} className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t("institusi_induk")}</p>
                      <p className="text-sm font-medium text-foreground">{institution.name}</p>
                    </div>
                  </div>
                )}

                {organization && (
                  <>
                    {institution && <div className="h-px bg-primary/10 w-full" />}
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm border border-primary/20 overflow-hidden flex-shrink-0">
                        {organization.logo_url && !organization.logo_url.includes("placeholders") ? (
                          <img src={organization.logo_url} alt={organization.name} className="h-full w-full object-contain" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{t("organisasi_umkm")}</p>
                        <p className="text-sm font-medium text-foreground">{organization.name}</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic px-2">{t("belum_berafiliasi_dengan_insti")}</p>
            )}

          </div>
        </div>

      </div>
    </AdminDialog>
  );
};
