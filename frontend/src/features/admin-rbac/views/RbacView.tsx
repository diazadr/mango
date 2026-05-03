"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, RefreshCcw, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminDialog,
  AdminPagination,
  AdminSearchFilter,
  AdminToolbar,
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
import { useRbac } from "../hooks/useRbac";

function formatName(value: string) {
  return value.replace(/_/g, " ");
}

export function RbacView() {
  const {
    users,
    availableRoles,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    isModalOpen,
    setIsModalOpen,
    selectedUser,
    selectedRoles,
    submitting,
    handleSyncRoles,
    openModifyModal,
    toggleRoleSelection,
    fetchData,
    status,
    setStatus,
    t,
  } = useRbac();

  const tc = useTranslations("DashboardCommon");

  const searchOptions = useMemo(() => [
    { value: "all", label: t("search_all") },
    { value: "name", label: t("search_name") },
    { value: "email", label: t("search_email") },
  ], [t]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      icon={UserPlus}
      actions={
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCcw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {t("refresh")}
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar>
              <AdminSearchFilter
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                selectLabel={tc("search_by")}
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm ? t("found_search", { count: totalUsers, search: searchTerm }) : t("found", { count: totalUsers })}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("loading")} />
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title={t("empty_title")} description={tc("try_adjusting_search")} />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>{t("table_user")}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t("table_roles")}</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">{tc("actions")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {users.map((user) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={user.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <StatusBadge key={role} type="role" value={role} />
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground/60">{t("no_roles")}</span>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => openModifyModal(user)}>
                          {t("modify")}
                        </Button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          )}

          {!loading && (
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
        <AdminDialog>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("modal_title")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{selectedUser?.email}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("select_roles")}</p>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                {availableRoles.map((role) => {
                  const selected = selectedRoles.includes(role.name);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRoleSelection(role.name)}
                      className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all text-left ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className={`text-sm font-medium capitalize ${selected ? "text-primary" : "text-foreground"}`}>
                          {formatName(role.name)}
                        </span>
                      </div>
                      {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                {tc("cancel")}
              </Button>
              <Button onClick={handleSyncRoles} disabled={submitting} className="flex-1 gap-2">
                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {t("save")}
              </Button>
            </div>
          </div>
        </AdminDialog>
      )}
    </DashboardPageShell>
  );
}
