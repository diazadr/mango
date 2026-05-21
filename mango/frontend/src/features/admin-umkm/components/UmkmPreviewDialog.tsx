"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { X, Mail, Phone, MapPin, Store, User as UserIcon, Calendar, Factory } from "lucide-react";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { Badge } from "@/src/components/ui/badge";

interface UmkmPreviewDialogProps {
  umkm: any;
  onClose: () => void;
}

export const UmkmPreviewDialog = ({
  umkm,
  onClose,
}: UmkmPreviewDialogProps) => {
    const t = useTranslations("UmkmPreviewDialog");

  if (!umkm) return null;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_umkm")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("informasi_profil_dan_legalitas")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 relative">
            {umkm.logo_url ? (
              <img 
                src={umkm.logo_url} 
                alt={umkm.name} 
                className="w-full h-full object-contain p-1" 
              />
            ) : (
              <Store className="h-8 w-8 text-primary/50" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">{umkm.name}</h3>
            <div className="flex items-center gap-2">
              {umkm.status === 'pending' ? (
                <Badge variant="warning" className="text-[10px] font-bold tracking-tight">{t("pending")}</Badge>
              ) : umkm.status === "rejected" ? (
                <Badge variant="destructive" className="text-[10px] font-bold tracking-tight">{t("ditolak")}</Badge>
              ) : (
                <StatusBadge type="status" value={umkm.is_active !== false ? "active" : "inactive"} />
              )}
              {umkm.sector && (
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider rounded-md border bg-primary/5 text-primary border-primary/20">
                  {umkm.sector}
                </span>
              )}
            </div>
            {umkm.description && (
              <p className="text-sm text-muted-foreground pt-2 line-clamp-2">
                {umkm.description}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider">{t("pemilik_kontak")}</h4>
          <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("nama_pemilik")}</p>
                <p className="text-sm font-medium text-foreground">{umkm.owner_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("telepon")}</p>
                <p className="text-sm font-medium text-foreground">{umkm.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("email_bisnis")}</p>
                <p className="text-sm font-medium text-foreground">{umkm.email || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider">{t("operasional_legalitas")}</h4>
          <div className="bg-primary/5 rounded-xl p-4 space-y-4 border border-primary/10">
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("alamat_produksi")}</p>
                <p className="text-sm font-medium text-foreground">
                  {umkm.address || "Belum ada informasi alamat"}
                </p>
                {(umkm.province || umkm.postal_code) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[umkm.province, umkm.postal_code].filter(Boolean).join(" - ")}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-primary/10 w-full" />

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Factory className="h-4 w-4" />
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1.5">{t("kapasitas_legalitas")}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-background rounded-lg p-2 border border-border/50 shadow-sm">
                    <p className="text-[10px] text-muted-foreground">{t("tahun_berdiri")}</p>
                    <p className="text-sm font-semibold">{umkm.established_year || "—"}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2 border border-border/50 shadow-sm">
                    <p className="text-[10px] text-muted-foreground">{t("karyawan")}</p>
                    <p className="text-sm font-semibold">{umkm.employee_count || "—"} org</p>
                  </div>
                  <div className="bg-background rounded-lg p-2 border border-border/50 shadow-sm col-span-2 md:col-span-1">
                    <p className="text-[10px] text-muted-foreground">{t("nib")}</p>
                    <p className="text-sm font-semibold">{umkm.nib || "Belum ada"}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminDialog>
  );
};
