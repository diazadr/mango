"use client";

import React from "react";
import { 
  UserPlus, Trash2, Pencil, Users
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
  InitialsAvatar,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow, 
  SortableHeader 
} from "@/src/components/ui/dashboard/AdminTable";
import { useUserAdmin } from "../hooks/useUserAdmin";
import { UserDialogForm } from "../components/UserDialogForm";

export function UserAdminView() {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    sortKey,
    sortOrder,
    handleSort,
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
  } = useUserAdmin();

  const searchOptions = [
    { value: "all", label: t("search_all") },
    { value: "name", label: t("search_name") },
    { value: "email", label: t("search_email") },
  ];

  const roleOptions = [
    { value: "all", label: t("all_roles") },
    { value: "super_admin", label: t("role_super_admin") },
    { value: "admin", label: t("role_admin") },
    { value: "advisor", label: t("role_advisor") },
    { value: "umkm", label: t("role_umkm") },
  ];

  const statusOptions = [
    { value: "all", label: t("all_status") },
    { value: "true", label: t("status_active") },
    { value: "false", label: t("status_inactive") },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Users}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="h-4 w-4" /> {t("add")}
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("filter_role")}
                  options={roleOptions}
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val)}
                />
                <AdminSelectFilter
                  label={t("filter_status")}
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
                  ? t("found_search", { count: totalUsers, search: searchTerm }) 
                  : t("found", { count: totalUsers })}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("loading")} />
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title={t("empty_title")} description={tc("try_adjusting_search_filter")} />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader label={t("table_user")} sortKey="name" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <SortableHeader label={t("table_email")} sortKey="email" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <SortableHeader label={t("table_phone")} sortKey="phone" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell>{t("table_role")}</AdminTableHeadCell>
                  <SortableHeader label={t("table_status")} sortKey="is_active" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <SortableHeader label={t("table_joined")} sortKey="created_at" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell align="center">{t("table_actions")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {users.map((user) => {
                  const role = user.roles?.[0];
                  const roleName = typeof role === "string" ? role : role?.name || "—";
                  
                  return (
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
                        <StatusBadge type="role" value={roleName} />
                      </AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge type="status" value={user.is_active ? "active" : "inactive"} />
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell align="center">
                        <div className="flex justify-center gap-1">
                          <AdminIconButton onClick={() => openEdit(user)} title={t("edit_title")} tone="primary">
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton onClick={() => setDeleteConfirmId(user.id)} title={t("delete_title")} tone="destructive">
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })}
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
        <UserDialogForm
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
          title={t("delete_title")}
          description={t("delete_desc")}
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
