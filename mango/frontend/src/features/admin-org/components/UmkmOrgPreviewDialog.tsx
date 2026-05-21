"use client";

import React from "react";
import { X, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { useTranslations } from "next-intl";

interface UmkmOrgPreviewDialogProps {
  organization: any;
  onClose: () => void;
}

export const UmkmOrgPreviewDialog = ({
  organization,
  onClose,
}: UmkmOrgPreviewDialogProps) => {
  const tc = useTranslations("DashboardCommon");
  const t = useTranslations("UmkmOrgPreviewDialog");

  if (!organization) return null;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_organisasi")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("informasi_profil_dan_kontak")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 relative">
            {organization.logo_url ? (
              <img 
                src={organization.logo_url} 
                alt={organization.name} 
                className="w-full h-full object-contain p-1" 
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-1">{organization.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge type="status" value={organization.is_active ? "active" : "inactive"} />
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {organization.display_type || organization.type}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground tracking-wider mb-2">{t("kontak_utama")}</p>
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("email")}</p>
                    <p className="text-sm font-semibold text-foreground">{organization.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("telepon")}</p>
                    <p className="text-sm font-semibold text-foreground">{organization.phone || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-muted-foreground tracking-wider mb-2">{t("penanggung_jawab")}</p>
              <div className="bg-muted/20 p-4 rounded-xl border border-border/50 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("nama_pic")}</p>
                  <p className="text-sm font-semibold text-foreground">{organization.pic_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("whatsapp_pic")}</p>
                  <p className="text-sm font-semibold text-foreground">{organization.pic_phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground tracking-wider mb-2">{t("lokasi_alamat")}</p>
              <div className="bg-muted/20 p-4 rounded-xl border border-border/50 h-full">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{organization.address || "Alamat tidak tersedia"}</p>
                    {(organization.village || organization.district || organization.regency || organization.province) && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {[
                          organization.village,
                          organization.district,
                          organization.regency,
                          organization.province,
                          organization.postal_code
                        ].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {organization.description && (
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-wider mb-2">{t("deskripsi")}</p>
            <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{organization.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/20 border-t border-border/50 flex justify-end shrink-0">
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-background border border-border font-bold text-sm hover:bg-muted transition-colors">
          Tutup
        </button>
      </div>
    </AdminDialog>
  );
};
