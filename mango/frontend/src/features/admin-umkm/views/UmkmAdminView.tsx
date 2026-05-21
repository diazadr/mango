"use client";

import { useTranslations } from "next-intl";
import React from "react";
import {
  Store, Activity, User as UserIcon,
  Calendar, Eye, Users, Building2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard, AdminToolbar, AdminSearchFilter,
  AdminSelectFilter, AdminIconButton, AdminPagination,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { useUmkmAdmin } from "../hooks/useUmkmAdmin";
import UmkmAssessmentDetail from "@/src/features/umkm-assessment/components/UmkmAssessmentDetail";
import { UmkmPreviewDialog } from "../components/UmkmPreviewDialog";

interface UmkmAdminViewProps {
  title: string;
  subtitle: string;
}

export function UmkmAdminView({ title, subtitle }: UmkmAdminViewProps) {
  const t = useTranslations("UmkmAdminView");

  const {
    filteredUmkm,
    loading,
    searchTerm, setSearchTerm,
    searchBy, setSearchBy,
    statusFilter, setStatusFilter,
    sortKey, sortOrder, handleSort,
    currentPage, setCurrentPage,
    totalPages, totalRecords,
    organization,
    detailUmkmId, setDetailUmkmId,
    isPreviewOpen, setIsPreviewOpen,
    previewUmkm,
    searchOptions,
    statusOptions,
    status, setStatus,
    openPreview,
  } = useUmkmAdmin();

  // ── Detail view ───────────────────────────────────────────────────────────
  if (detailUmkmId) {
    return (
      <UmkmAssessmentDetail
        umkmId={detailUmkmId}
        onClose={() => setDetailUmkmId(null)}
      />
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardPageShell title={title} subtitle={subtitle} icon={Store}>
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("cari_umkm")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Badge organisasi */}
                {organization && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                    <Building2 size={12} className="text-primary" />
                    <span className="text-xs font-medium text-primary">{organization.name}</span>
                  </div>
                )}
                <AdminSelectFilter
                  label={t("label_status")}
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${totalRecords} hasil untuk "${searchTerm}"`
                  : `Total ${totalRecords} UMKM terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_data_umkm")} />
          ) : filteredUmkm.length === 0 ? (
            <EmptyState
              icon={Store}
              title={t("belum_ada_umkm_terdaftar")}
              description={t("tidak_ada_data_umkm_yang_memen")}
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <SortableHeader label={t("nama_umkm")}     sortKey="name"             currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("pemilik")}       sortKey="owner"            currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("sektor")}        sortKey="sector"           currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("karyawan")}      sortKey="employee_count"   currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("tahun_berdiri")} sortKey="established_year" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("status")}        sortKey="status"           currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filteredUmkm.map((umkm: any) => (
                    <AdminTableRow key={umkm.id}>

                      {/* Nama UMKM */}
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {umkm.logo_url && !umkm.logo_url.includes('placeholders') ? (
                              <img src={umkm.logo_url} alt={umkm.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-primary">
                                {umkm.name?.substring(0, 2).toUpperCase() || 'UK'}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[180px]">
                            {umkm.name}
                          </span>
                        </div>
                      </AdminTableCell>

                      {/* Pemilik */}
                      <AdminTableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <UserIcon size={12} className="text-primary shrink-0" />
                          <span className="truncate max-w-[140px]">{umkm.owner_name || "—"}</span>
                        </div>
                      </AdminTableCell>

                      {/* Sektor */}
                      <AdminTableCell>
                        {umkm.sector ? (
                          <span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            {umkm.sector}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </AdminTableCell>

                      {/* Karyawan */}
                      <AdminTableCell>
                        {umkm.employee_count ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users size={12} className="shrink-0" />
                            <span>{umkm.employee_count}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </AdminTableCell>

                      {/* Tahun Berdiri */}
                      <AdminTableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar size={12} className="shrink-0" />
                          <span>{umkm.established_year || "—"}</span>
                        </div>
                      </AdminTableCell>

                      {/* Status */}
                      <AdminTableCell>
                        {umkm.status === "pending" ? (
                          <Badge variant="warning" className="text-[10px] font-bold tracking-tight">
                            {t("pending")}
                          </Badge>
                        ) : umkm.status === "rejected" ? (
                          <Badge variant="destructive" className="text-[10px] font-bold tracking-tight">
                            {t("ditolak")}
                          </Badge>
                        ) : (
                          <StatusBadge type="status" value={umkm.is_active ? "active" : "inactive"} />
                        )}
                      </AdminTableCell>

                      {/* Aksi */}
                      <AdminTableCell align="right">
                        <div className="flex justify-end gap-1">
                          <AdminIconButton onClick={() => openPreview(umkm)} title={t("lihat_profil")} tone="default">
                            <Eye className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton onClick={() => setDetailUmkmId(umkm.id)} title={t("lihat_analisis")} tone="primary">
                            <Activity className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setCurrentPage}
            />
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