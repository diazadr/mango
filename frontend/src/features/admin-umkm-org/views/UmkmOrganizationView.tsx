"use client";

import React from "react";
import {
    Store, Plus, Pencil, Trash2,
    MapPin, Mail, Building2
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
import { useUmkmOrganizations } from "../hooks/useUmkmOrganizations";
import { UmkmOrgDialogForm } from "../components/UmkmOrgDialogForm";

export function UmkmOrganizationView() {
  const {
    organizations,
    uptList,
    loading,
    searchTerm,
    setSearchTerm,
    uptFilter,
    setUptFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalRecords,
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
  } = useUmkmOrganizations();

  const searchOptions = [
    { value: "all", label: "Semua kolom" },
    { value: "name", label: "Nama" },
  ];

  const typeOptions = [
    { value: "all", label: "Semua Tipe" },
    { value: "upt", label: "Unit Pengelola (UPT)" },
    { value: "umkm_group", label: "IKM/UMKM Group" },
  ];

  const uptOptions = [
    { value: "all", label: "Semua UPT Pembina" },
    ...uptList.map(upt => ({ value: upt.id.toString(), label: upt.name }))
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Manajemen Organisasi"
      subtitle="Kelola data Unit Pengelola (UPT) dan organisasi payung/kelompok UMKM."
      icon={Store}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah organisasi
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                placeholder="Cari organisasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption="all"
                onOptionChange={() => {}}
              />
              <AdminSelectFilter
                label="Tipe"
                options={typeOptions}
                value="all"
                onChange={() => {}}
              />
              <AdminSelectFilter
                label="UPT Pembina"
                options={uptOptions}
                value={uptFilter}
                onChange={(val) => setUptFilter(val)}
              />
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                Total {totalRecords} organisasi terdaftar
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data..." />
          ) : organizations.length === 0 ? (
            <EmptyState icon={Store} title="Tidak ada organisasi" description="Belum ada data organisasi UMKM yang terdaftar." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Organisasi</AdminTableHeadCell>
                  <AdminTableHeadCell>UPT Pembina</AdminTableHeadCell>
                  <AdminTableHeadCell>Kontak</AdminTableHeadCell>
                  <AdminTableHeadCell>Status</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {organizations.map((org) => (
                  <AdminTableRow key={`${org.type}-${org.id}`}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {org.type === 'upt' ? <Building2 className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.display_type}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-muted-foreground" />
                        <span className="text-sm">{org.upt?.name || "N/A"}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        {org.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail size={12} className="text-primary shrink-0" /> {org.email}
                            </div>
                        )}
                        {org.address && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate max-w-[150px]">{org.address}</span>
                            </div>
                        )}
                      </div>
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
        <UmkmOrgDialogForm
          form={form}
          uptList={uptList}
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
          title="Hapus organisasi?"
          description="Seluruh data yang terhubung dengan organisasi ini mungkin akan terdampak. Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
