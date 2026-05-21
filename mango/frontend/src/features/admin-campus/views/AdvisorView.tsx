"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { 
  UserPlus, Trash2, Pencil, GraduationCap, Eye
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
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
  InitialsAvatar,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { useAdvisors } from "../hooks/useAdvisors";
import { AdvisorDialogForm } from "../components/AdvisorDialogForm";
import { AdvisorPreviewDialog } from "../components/AdvisorPreviewDialog";

export function AdvisorView() {
    
  const {
    advisors,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    departmentFilter,        // ← tambah di hook
    setDepartmentFilter,     // ← tambah di hook
    currentPage,
    setCurrentPage,
    totalPages,
    totalAdvisors,
    sortKey,                 // ← tambah di hook
    sortOrder,               // ← tambah di hook
    handleSort,              // ← tambah di hook
    isModalOpen,
    setIsModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    editingUser,
    previewUser,
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
    openPreview,
    departments,
  } = useAdvisors();

  const t = useTranslations("AdvisorView");
  const tc = useTranslations("DashboardCommon");

  const searchOptions = [
    { value: "all", label: "Semua" },
    { value: "name", label: "Nama" },
    { value: "email", label: "Email" },
  ];

  const departmentOptions = [
    { value: "all", label: "Semua Departemen" },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title={t("manajemen_advisor")}
      subtitle={t("daftar_tenaga_ahli_dan_pembimb")}
      icon={GraduationCap}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" />{t("tambah_advisor")}
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("cari_advisor")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_filter_departemen")}
                  options={departmentOptions}
                  value={departmentFilter}
                  onChange={(val) => setDepartmentFilter(val)}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${totalAdvisors} hasil untuk "${searchTerm}"`
                  : `Total ${totalAdvisors} advisor terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_data")} />
          ) : totalAdvisors === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={t("tidak_ada_advisor")}
              description={t("belum_ada_advisor_yang_terdaft")}
            />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader label={t("nama")} sortKey="name" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <SortableHeader label={t("email")} sortKey="email" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell>{t("unit_departemen")}</AdminTableHeadCell>
                  <SortableHeader label={t("telepon")} sortKey="phone" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {advisors.map((user) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={user.name} imageUrl={user.avatar_url} />
                        <span className="font-medium text-foreground truncate max-w-[180px]">
                          {user.name}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                        {departments.find(d => d.id === user.institutions?.[0]?.department_id)?.name || "—"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{user.phone || "—"}</span>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openPreview(user)} title={t("lihat_detail")} tone="default">
                          <Eye className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => openEdit(user)} title={t("edit")} tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(user.id)} title={t("hapus")} tone="destructive">
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
          departments={departments}
        />
      )}

      {isPreviewOpen && previewUser && (
        <AdvisorPreviewDialog
          user={previewUser}
          departments={departments}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title={t("hapus_advisor")}
          description={t("tindakan_ini_tidak_dapat_dibat")}
          confirmLabel={tc("delete")}
          cancelLabel={tc("cancel")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}