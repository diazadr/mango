"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Fingerprint, Key, Loader2, Pencil, Plus, ShieldAlert, Trash2, X, AlertCircle } from "lucide-react";

import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  AdminDataCard,
  AdminDialog,
  AdminIconButton,
  AdminPagination,
  AdminSearchFilter,
  AdminSelectFilter,
  AdminState,
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

type Permission = {
  id: number;
  name: string;
  created_at?: string;
};

type ValidationErrorResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string | string[]>;
    };
  };
};

const API_URL = "/v1/admin/permissions";
const PER_PAGE = 10;

function moduleName(permission: string) {
  return permission.split(/[._\s-]/)[0] || "core";
}

export default function PermissionsPage() {
  const t = useTranslations("RbacPermissionsPage");
  const tc = useTranslations("DashboardCommon");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPermissions, setTotalPermissions] = useState(0);

  const [sortKey, setSortKey] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URL, {
        params: { 
          search: searchTerm, 
          search_by: searchBy, 
          module: moduleFilter !== "all" ? moduleFilter : undefined,
          page: currentPage, 
          per_page: PER_PAGE,
          sort_by: sortKey,
          sort_dir: sortOrder,
        },
      });
      setPermissions(res.data.data || []);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
      setTotalPermissions(res.data.meta?.total || res.data.total || 0);
    } catch {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchBy, searchTerm, moduleFilter, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchBy, searchTerm, moduleFilter, sortKey, sortOrder]);

  useEffect(() => {
    const delay = setTimeout(fetchPermissions, 400);
    return () => clearTimeout(delay);
  }, [fetchPermissions]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const searchOptions = useMemo(() => [
    { value: "all", label: t("search_all") },
    { value: "name", label: t("search_name") },
  ], [t]);

  const moduleOptions = useMemo(() => [
    { value: "all", label: t("all_modules") },
    { value: "users", label: "Users" },
    { value: "roles", label: "Roles" },
    { value: "permissions", label: "Permissions" },
    { value: "organizations", label: "Organizations" },
    { value: "departments", label: "Departments" },
    { value: "upt", label: "UPT" },
    { value: "campus", label: "Campus" },
    { value: "articles", label: "Articles" },
  ], [t]);

  const openCreate = () => {
    setEditingPermission(null);
    setFormData({ name: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
    setFormErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setStatus(null);
    try {
      const payload = { name: formData.name.trim().toLowerCase().replace(/\s+/g, "_") };
      if (editingPermission) {
        await api.put(`${API_URL}/${editingPermission.id}`, payload);
        setStatus({ type: "success", message: "Permission updated successfully" });
      } else {
        await api.post(API_URL, payload);
        setStatus({ type: "success", message: "Permission created successfully" });
      }
      closeModal();
      fetchPermissions();
    } catch (err: unknown) {
      const response = err as ValidationErrorResponse;
      const errors = response.response?.data?.errors || {};
      const mapped: Record<string, string> = {};
      Object.entries(errors).forEach(([key, value]) => {
        mapped[key] = Array.isArray(value) ? String(value[0]) : String(value);
      });
      setFormErrors(mapped);
      setStatus({ type: "destructive", message: response.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setStatus(null);
    try {
      await api.delete(`${API_URL}/${deleteId}`);
      setDeleteId(null);
      setStatus({ type: "success", message: "Permission deleted successfully" });
      fetchPermissions();
    } catch {
      setStatus({ type: "destructive", message: "Failed to delete permission" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Fingerprint}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      }
    >
      <div className="space-y-6">
        {status && (
          <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300">
            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="flex items-center justify-between">
              {status.message}
              <button onClick={() => setStatus(null)} className="ml-4 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100">
                Close
              </button>
            </AlertDescription>
          </Alert>
        )}

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                selectLabel={tc("search_by")}
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("filter_module")}
                  options={moduleOptions}
                  value={moduleFilter}
                  onChange={(val) => setModuleFilter(val)}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">
                {searchTerm ? t("found_search", { count: totalPermissions, search: searchTerm }) : t("found", { count: totalPermissions })}
              </p>
            ) : null
          }
        >
          {loading ? (
            <AdminState icon={Loader2} title={t("loading")} loading />
          ) : permissions.length === 0 ? (
            <AdminState icon={Key} title={t("empty_title")} description={tc("try_adjusting_search")} />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader 
                    label={t("table_permission")} 
                    sortKey="name" 
                    currentSort={sortKey} 
                    direction={sortOrder} 
                    onSort={handleSort} 
                  />
                  <AdminTableHeadCell>{t("table_module")}</AdminTableHeadCell>
                  <SortableHeader 
                    label={t("table_created")} 
                    sortKey="created_at" 
                    currentSort={sortKey} 
                    direction={sortOrder} 
                    onSort={handleSort} 
                    className="hidden lg:table-cell"
                  />
                  <AdminTableHeadCell align="right">{tc("actions")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {permissions.map((permission) => (
                  <AdminTableRow key={permission.id}>
                    <AdminTableCell>
                      <p className="font-bold text-muted-foreground truncate">{permission.name}</p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary rounded-md text-[9px] font-black uppercase whitespace-nowrap">
                        {moduleName(permission.name)}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableCell className="hidden lg:table-cell">
                      <span className="text-[10px] font-bold text-muted-foreground/80 whitespace-nowrap">
                        {permission.created_at ? new Date(permission.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(permission)} title={t("edit_title")} tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteId(permission.id)} tone="destructive" title={t("delete_title")}>
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
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
              <h2 className="text-lg font-semibold text-foreground">
                {editingPermission ? t("modal_edit_title") : t("modal_create_title")}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("modal_desc")}</p>
            </div>
            <button onClick={closeModal} className="p-2 rounded-md text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-md flex gap-3">
              <ShieldAlert className="text-warning shrink-0 h-5 w-5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                {t("warning")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                placeholder="e.g. manage_users"
                value={formData.name}
                onChange={(event) => setFormData({ name: event.target.value })}
                required
              />
              {formErrors.name && <p className="text-xs font-medium text-destructive">{formErrors.name}</p>}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 gap-2">
                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {editingPermission ? tc("save_changes") : t("create_button")}
              </Button>
            </div>
          </form>
        </AdminDialog>
      )}

      {deleteId !== null && (
        <ConfirmDialog
          icon={Trash2}
          title={t("delete_title")}
          description={t("delete_desc")}
          confirmLabel={deleting ? tc("deleting") : tc("delete")}
          destructive
          loading={deleting}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardPageShell>
  );
}
