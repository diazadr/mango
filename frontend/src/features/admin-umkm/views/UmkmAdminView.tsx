"use client";

import React from "react";
import { Store, Activity, User as UserIcon, Calendar } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminToolbar,
  AdminSearchFilter,
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
import { useUmkmAdmin } from "../hooks/useUmkmAdmin";
import UmkmAssessmentDetail from "@/src/app/[locale]/(dashboard)/workspace/umkm/components/UmkmAssessmentDetail";

interface UmkmAdminViewProps {
  title: string;
  subtitle: string;
}

export function UmkmAdminView({ title, subtitle }: UmkmAdminViewProps) {
  const {
    filteredUmkm,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    organization,
    detailUmkmId,
    setDetailUmkmId,
    searchOptions,
    status,
    setStatus
  } = useUmkmAdmin();

  if (detailUmkmId) {
    return <UmkmAssessmentDetail umkmId={detailUmkmId} onClose={() => setDetailUmkmId(null)} />;
  }

  return (
    <DashboardPageShell
      title={title}
      subtitle={subtitle}
      icon={Store}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                placeholder="Cari UMKM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
              />
              {organization && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-xs font-medium text-primary">{organization.name}</span>
                </div>
              )}
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm ? `Ditemukan ${filteredUmkm.length} hasil untuk "${searchTerm}"` : `Total ${filteredUmkm.length} UMKM terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data UMKM..." />
          ) : filteredUmkm.length === 0 ? (
            <EmptyState icon={Store} title="Belum ada UMKM terdaftar" description="Tidak ada data UMKM yang memenuhi kriteria pencarian Anda." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Nama UMKM</AdminTableHeadCell>
                  <AdminTableHeadCell>Pemilik</AdminTableHeadCell>
                  <AdminTableHeadCell>Sektor</AdminTableHeadCell>
                  <AdminTableHeadCell>Karyawan</AdminTableHeadCell>
                  <AdminTableHeadCell>Tahun berdiri</AdminTableHeadCell>
                  <AdminTableHeadCell>Status</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {filteredUmkm.map((umkm: any) => (
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
                        <UserIcon size={12} className="text-primary shrink-0" />
                        <span className="truncate max-w-[150px]">{umkm.owner_name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{umkm.sector || "—"}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{umkm.employee_count || "—"}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar size={12} className="shrink-0" />
                        <span>{umkm.established_year || "—"}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge type="status" value={umkm.is_active ? "active" : "inactive"} />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end">
                        <AdminIconButton onClick={() => setDetailUmkmId(umkm.id)} title="Lihat analisis" tone="primary">
                          <Activity className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          )}
        </AdminDataCard>
      </div>
    </DashboardPageShell>
  );
}
