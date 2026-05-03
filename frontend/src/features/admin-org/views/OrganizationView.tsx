"use client";

import React from "react";
import {
    Building2, Plus, Pencil, Trash2, School, Building,
    MapPin, Mail
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminIconButton,
  AdminPagination,
  AdminSearchFilter,
  AdminSelectFilter,
  AdminToolbar,
  ConfirmDialog,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow, 
} from "@/src/components/ui/dashboard/AdminTable";
import { useOrganizations } from "../hooks/useOrganizations";
import { OrgDialogForm } from "../components/OrgDialogForm";

const typeIcons: Record<string, any> = {
    kampus: School,
    upt: Building,
};

function OrgAvatar({ type }: { type: string }) {
    const Icon = typeIcons[type] || Building2;
    return (
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
        </div>
    );
}

export function OrganizationView() {
  const {
    organizations,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalOrgs,
    isModalOpen,
    setIsModalOpen,
    editingOrg,
    submitting,
    deleteConfirmId,
    setDeleteConfirmId,
    form,
    onSubmit,
    handleDelete,
    status,
    setStatus,
    openCreate,
    openEdit,
    t,
    tc,
  } = useOrganizations();

  const searchOptions = [
    { value: "all", label: t("search_all") },
    { value: "name", label: t("search_name") },
    { value: "email", label: t("search_email") },
  ];

  const typeOptions = [
    { value: "all", label: "Semua tipe" },
    { value: "kampus", label: "Kampus" },
    { value: "upt", label: "UPT" },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Manajemen Institusi"
      subtitle="Kelola entitas kampus yang membina organisasi UMKM."
      icon={Building2}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah institusi
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
              />
              <AdminSelectFilter
                label="Tipe"
                options={typeOptions}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
              />
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm ? `Ditemukan ${totalOrgs} hasil untuk "${searchTerm}"` : `Total ${totalOrgs} institusi terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data..." />
          ) : organizations.length === 0 ? (
            <EmptyState icon={Building2} title="Tidak ada institusi" description="Belum ada data institusi yang memenuhi kriteria Anda." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Institusi</AdminTableHeadCell>
                  <AdminTableHeadCell>Kontak</AdminTableHeadCell>
                  <AdminTableHeadCell>Alamat</AdminTableHeadCell>
                  <AdminTableHeadCell>Status</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {organizations.map((org) => (
                  <AdminTableRow key={org.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <OrgAvatar type={org.type} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.display_type}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      {org.email ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail size={12} className="text-primary shrink-0" /> {org.email}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      {org.address ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate max-w-[200px]">{org.address}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                        <StatusBadge type="status" value={org.is_active ? "active" : "inactive"} />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(org)} title="Edit" tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(org.id)} title="Hapus" tone="destructive">
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
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

      {isModalOpen && (
        <OrgDialogForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={submitting}
          onClose={() => setIsModalOpen(false)}
          editingOrg={editingOrg}
          t={t}
          tc={tc}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title="Hapus institusi?"
          description="Seluruh data yang terhubung dengan institusi ini mungkin akan terdampak. Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
