"use client";

import React from "react";
import { 
  UserPlus, Trash2, Pencil, GraduationCap, Mail, Phone
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
  AdminToolbar,
  ConfirmDialog,
  InitialsAvatar,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow, 
} from "@/src/components/ui/dashboard/AdminTable";
import { useAdvisors } from "../hooks/useAdvisors";
import { AdvisorDialogForm } from "../components/AdvisorDialogForm";

export function AdvisorView() {
  const {
    advisors,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalAdvisors,
    isModalOpen,
    setIsModalOpen,
    editingUser,
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
  } = useAdvisors();

  const searchOptions = [
    { value: "name", label: "Nama" },
    { value: "email", label: "Email" },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Manajemen advisor"
      subtitle="Daftar tenaga ahli dan pembimbing UMKM yang terverifikasi."
      icon={GraduationCap}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" /> Tambah advisor
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                placeholder="Cari advisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
              />
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm ? `Ditemukan ${totalAdvisors} hasil untuk "${searchTerm}"` : `Total ${totalAdvisors} advisor terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data..." />
          ) : advisors.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Tidak ada advisor" description="Belum ada advisor yang terdaftar di sistem." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Nama</AdminTableHeadCell>
                  <AdminTableHeadCell>Email</AdminTableHeadCell>
                  <AdminTableHeadCell>Telepon</AdminTableHeadCell>
                  <AdminTableHeadCell>Status</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {advisors.map((user) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={user.name} />
                        <span className="font-medium text-foreground truncate max-w-[180px]">{user.name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{user.phone || "—"}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge type="role" value="advisor" />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(user)} title="Edit" tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(user.id)} title="Hapus" tone="destructive">
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
        <AdvisorDialogForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={submitting}
          onClose={() => setIsModalOpen(false)}
          editingUser={editingUser}
          t={t}
          tc={tc}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title="Hapus advisor?"
          description="Tindakan ini tidak dapat dibatalkan. Akun advisor akan dihapus dari sistem."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
