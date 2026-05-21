"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { UserCheck, CheckCircle2, XCircle, Loader2, Store, Calendar, Users, Eye } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminIconButton,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import { useOrganizationApprovals } from "../hooks/useOrganizationApprovals";
import { UmkmPreviewDialog } from "../../admin-umkm/components/UmkmPreviewDialog";

export function OrganizationApprovalsView() {
    const t = useTranslations("OrganizationApprovalsView");

  const {
    umkms,
    loading,
    processingId,
    organization,
    isPreviewOpen,
    setIsPreviewOpen,
    previewUmkm,
    handleUpdateUmkmStatus,
    openPreview,
    status,
    setStatus,
  } = useOrganizationApprovals();

  return (
    <DashboardPageShell
      title={t("persetujuan_anggota")}
      subtitle={t("verifikasi_dan_berikan_otorisa")}
      icon={UserCheck}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {organization && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("organisasi")}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{organization.name}</p>
            </div>
          </div>
        )}

          <AdminDataCard
            description={
              !loading ? (
                <p className="text-xs text-muted-foreground px-1">
                  {umkms.length > 0 ? `${umkms.length} permohonan UMKM menunggu verifikasi` : "Tidak ada permohonan UMKM baru"}
                </p>
              ) : null
            }
          >
            {loading ? (
              <LoadingState message={t("message_memuat_permohonan_umkm")} />
            ) : umkms.length === 0 ? (
              <EmptyState icon={Store} title={t("antrean_umkm_kosong")} description={t("belum_ada_permohonan_pendaftar")} />
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHeadCell>{t("nama_umkm")}</AdminTableHeadCell>
                    <AdminTableHeadCell>{t("pemilik")}</AdminTableHeadCell>
                    <AdminTableHeadCell>{t("sektor")}</AdminTableHeadCell>
                    <AdminTableHeadCell>{t("tahun_berdiri")}</AdminTableHeadCell>
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {umkms.map((umkm) => (
                    <AdminTableRow key={umkm.id}>
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Store className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[200px]">{umkm.name}</span>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span className="truncate max-w-[150px]">{umkm.owner_name}</span>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-sm text-muted-foreground">{umkm.sector || "—"}</span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar size={12} className="shrink-0" />
                          <span>{umkm.established_year || "—"}</span>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell align="right">
                        <div className="flex justify-end gap-2 items-center">
                          <AdminIconButton onClick={() => openPreview(umkm)} title={t("lihat_profil")} tone="default">
                            <Eye className="h-4 w-4" />
                          </AdminIconButton>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5"
                            onClick={() => handleUpdateUmkmStatus(umkm.uuid, false)}
                            disabled={processingId === `umkm-${umkm.uuid}`}
                          >
                            <XCircle size={14} /> {t("tolak")}
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-success hover:bg-success/80"
                            onClick={() => handleUpdateUmkmStatus(umkm.uuid, true)}
                            disabled={processingId === `umkm-${umkm.uuid}`}
                          >
                            {processingId === `umkm-${umkm.uuid}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} {t("setujui")}
                          </Button>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            )}
          </AdminDataCard>
      </div>

      {isPreviewOpen && previewUmkm && (
        <UmkmPreviewDialog
          umkm={previewUmkm}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </DashboardPageShell>
  );
}
