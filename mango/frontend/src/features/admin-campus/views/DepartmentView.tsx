"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { 
  Layers, Plus, Pencil, Trash2, Eye
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
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { useDepartments } from "../hooks/useDepartments";
import { DeptDialogForm } from "../components/DeptDialogForm";
import { DepartmentPreviewDialog } from "../components/DepartmentPreviewDialog";

export function DepartmentView() {
    
  const {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    statusFilter,       // ← baru
    setStatusFilter,    // ← baru
    sortKey,            // ← baru
    sortOrder,          // ← baru
    handleSort,         // ← baru
    currentPage,
    setCurrentPage,
    totalPages,
    totalDepts,
    campus,
    isModalOpen,
    setIsModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    editingDept,
    previewDept,
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
  } = useDepartments();

  const t = useTranslations("DepartmentView");
  const tc = useTranslations("DashboardCommon");

  const searchOptions = [
    { value: "all", label: tc("all") },
    { value: "name", label: "Nama unit" },
  ];

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "true", label: "Aktif" },
    { value: "false", label: "Nonaktif" },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title={t("manajemen_departemen")}
      subtitle={t("kelola_unit_operasional_dan_sp")}
      icon={Layers}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />{t("tambah_unit")}
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("cari_departemen")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_filter_status")}
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${totalDepts} hasil untuk "${searchTerm}"`
                  : `Total ${totalDepts} unit terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_data")} />
          ) : totalDepts === 0 ? (
            <EmptyState
              icon={Layers}
              title={t("tidak_ada_unit")}
              description={t("belum_ada_departemen_yang_terd")}
            />
          ) : (
            <AdminTable>
           <AdminTableHeader>
  <AdminTableRow>
    <SortableHeader label={t("nama_unit")} sortKey="name" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
    <AdminTableHeadCell>{t("deskripsi")}</AdminTableHeadCell>
    <SortableHeader label={t("label_kepala_unit")} sortKey="head_name" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
    <AdminTableHeadCell>{t("email")}</AdminTableHeadCell>
    <AdminTableHeadCell>{t("telepon")}</AdminTableHeadCell>
    <AdminTableHeadCell>{t("lokasi")}</AdminTableHeadCell>
    <SortableHeader label={t("status")} sortKey="is_active" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
  </AdminTableRow>
</AdminTableHeader>
<AdminTableBody>
  {departments.map((dept) => (
    <AdminTableRow key={dept.id}>
      <AdminTableCell>
        <span className="font-medium text-foreground">{dept.name}</span>
      </AdminTableCell>
      <AdminTableCell>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] line-clamp-1">
          {dept.description || "—"}
        </p>
      </AdminTableCell>
      <AdminTableCell>
        <span className="text-sm text-muted-foreground">{dept.head_name || "—"}</span>
      </AdminTableCell>
      <AdminTableCell>
        <span className="text-sm text-muted-foreground">{dept.email || "—"}</span>
      </AdminTableCell>
      <AdminTableCell>
        <span className="text-sm text-muted-foreground">{dept.phone || "—"}</span>
      </AdminTableCell>
      <AdminTableCell>
        <span className="text-sm text-muted-foreground">{dept.location || "—"}</span>
      </AdminTableCell>
      <AdminTableCell>
        <StatusBadge type="status" value={dept.is_active ? "active" : "inactive"} />
      </AdminTableCell>
      <AdminTableCell align="right">
        <div className="flex justify-end gap-1">
          <AdminIconButton onClick={() => openPreview(dept)} title={t("lihat_detail")} tone="default">
            <Eye className="h-4 w-4" />
          </AdminIconButton>
          <AdminIconButton onClick={() => openEdit(dept)} title={t("edit")} tone="primary">
            <Pencil className="h-4 w-4" />
          </AdminIconButton>
          <AdminIconButton onClick={() => setDeleteConfirmId(dept.id)} title={t("hapus")} tone="destructive">
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
        />
      )}

      {isPreviewOpen && previewDept && (
        <DepartmentPreviewDialog
          department={previewDept}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          icon={Trash2}
          title={t("hapus_unit_departemen")}
          description={t("seluruh_keterhubungan_advisor_")}
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