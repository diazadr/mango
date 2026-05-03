"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Pencil, Plus, Shield, ShieldAlert, Trash2, X, AlertCircle } from "lucide-react";

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
} from "@/src/components/ui/dashboard/AdminTable";

type Role = {
  id: number;
  name: string;
  guard_name?: string;
  permissions?: string[];
};

type ValidationErrorResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string | string[]>;
    };
  };
};

const API_URL = "/v1/admin/roles";
const PER_PAGE = 10;

function formatName(value: string) {
  return value.replace(/_/g, " ");
}

export default function RolesPage() {
  const t = useTranslations("RbacRolesPage");
  const tc = useTranslations("DashboardCommon");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URL, {
        params: { search: searchTerm, search_by: searchBy, page: currentPage, per_page: PER_PAGE },
      });
      setRoles(res.data.data || []);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
      setTotalRoles(res.data.meta?.total || res.data.total || 0);
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchBy, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchBy, searchTerm]);

  useEffect(() => {
    const delay = setTimeout(fetchRoles, 400);
    return () => clearTimeout(delay);
  }, [fetchRoles]);

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

  const openCreate = () => {
    setEditingRole(null);
    setFormData({ name: "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setStatus(null);
    try {
      const payload = { name: formData.name.trim().toLowerCase().replace(/\s+/g, "_") };
      if (editingRole) {
        await api.put(`${API_URL}/${editingRole.id}`, payload);
        setStatus({ type: "success", message: "Role updated successfully" });
      } else {
        await api.post(API_URL, payload);
        setStatus({ type: "success", message: "Role created successfully" });
      }
      closeModal();
      fetchRoles();
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
      setStatus({ type: "success", message: "Role deleted successfully" });
      fetchRoles();
    } catch {
      setStatus({ type: "destructive", message: "Failed to delete role" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Shield}
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
              <>
                {searchTerm ? t("found_search", { count: totalRoles, search: searchTerm }) : t("found", { count: totalRoles })}
              </>
            ) : null
          }
        >
          {loading ? (
            <AdminState icon={Loader2} title={t("loading")} loading />
          ) : roles.length === 0 ? (
            <AdminState icon={Shield} title={t("empty_title")} description={tc("try_adjusting_search")} />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>{t("table_role")}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t("table_permissions")}</AdminTableHeadCell>
                  <AdminTableHeadCell className="hidden md:table-cell">{t("table_guard")}</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">{tc("actions")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {roles.map((role) => (
                  <AdminTableRow key={role.id}>
                    <AdminTableCell>
                      <p className="font-bold text-muted-foreground capitalize truncate">{formatName(role.name)}</p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 4).map((permission) => (
                            <Badge key={permission} variant="outline" className="border-primary/20 bg-primary/5 text-primary rounded-md text-[9px] font-black uppercase whitespace-nowrap">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground/60">{t("no_permissions")}</span>
                        )}
                        {role.permissions && role.permissions.length > 4 && (
                          <Badge variant="secondary" className="rounded-md text-[9px] font-black uppercase whitespace-nowrap">+{role.permissions.length - 4}</Badge>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="rounded-md text-[9px] font-black uppercase whitespace-nowrap">{role.guard_name || "web"}</Badge>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(role)} title={t("edit_title")} tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteId(role.id)} tone="destructive" title={t("delete_title")}>
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
              <h2 className="text-lg font-semibold text-foreground">{editingRole ? t("modal_edit_title") : t("modal_create_title")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("modal_desc")}</p>
            </div>
            <button onClick={closeModal} className="p-2 rounded-md text-muted-foreground hover:bg-background hover:text-foreground border border-transparent hover:border-border transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-md flex gap-3">
              <ShieldAlert className="text-primary shrink-0 h-5 w-5" />
              <p className="text-sm text-primary leading-relaxed">
                {t("warning")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                placeholder="e.g. system_admin"
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
                {editingRole ? tc("save_changes") : t("create_button")}
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
