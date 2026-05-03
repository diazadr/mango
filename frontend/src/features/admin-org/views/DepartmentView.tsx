"use client";

import React from "react";
import { 
    Layers, Plus, Pencil, Trash2, Building2
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
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow, 
} from "@/src/components/ui/dashboard/AdminTable";
import { useDepartments } from "../hooks/useDepartments";
import { DeptDialogForm } from "../components/DeptDialogForm";

export function DepartmentView() {
  const {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalDepts,
    campus,
    isModalOpen,
    setIsModalOpen,
    editingDept,
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
  } = useDepartments();

  const searchOptions = [
    { value: "all", label: tc("all") },
    { value: "name", label: "Nama unit" },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Manajemen departemen"
      subtitle="Kelola unit operasional dan spesialisasi keahlian dalam institusi."
      icon={Layers}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah unit
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                placeholder="Cari departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
              />
              {campus && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                    <Building2 size={14} className="text-primary" />
                    <span className="text-xs font-medium text-primary">{campus.name}</span>
                </div>
              )}
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm ? `Ditemukan ${totalDepts} hasil untuk "${searchTerm}"` : `Total ${totalDepts} unit terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data..." />
          ) : departments.length === 0 ? (
            <EmptyState icon={Layers} title="Tidak ada unit" description="Belum ada departemen yang terdaftar di bawah institusi ini." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Nama unit</AdminTableHeadCell>
                  <AdminTableHeadCell>Deskripsi</AdminTableHeadCell>
                  <AdminTableHeadCell>Status</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {departments.map((dept) => (
                  <AdminTableRow key={dept.id}>
                    <AdminTableCell>
                        <span className="font-medium text-foreground">{dept.name}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-md line-clamp-1">{dept.description || "Tidak ada deskripsi."}</p>
                    </AdminTableCell>
                    <AdminTableCell>
                        <StatusBadge type="status" value={dept.is_active ? "active" : "inactive"} />
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(dept)} title="Edit" tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(dept.id)} title="Hapus" tone="destructive">
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
        <DeptDialogForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={submitting}
          onClose={() => setIsModalOpen(false)}
          editingDept={editingDept}
          campus={campus}
          t={t}
          tc={tc}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          icon={Trash2}
          title="Hapus unit departemen?"
          description="Seluruh keterhubungan advisor dengan unit ini mungkin akan terputus. Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
