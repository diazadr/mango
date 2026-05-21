"use client";

import { useTranslations } from "next-intl";
import React from "react";
import {
  Store, Plus, Pencil, Trash2,
  MapPin, Mail, Eye, Phone,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard, AdminIconButton, AdminPagination,
  AdminSearchFilter, AdminSelectFilter,
  AdminToolbar, ConfirmDialog,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { useUmkmOrganizations } from "../hooks/useUmkmOrganizations";
import { UmkmOrgDialogForm } from "../components/UmkmOrgDialogForm";
import { UmkmOrgPreviewDialog } from "../components/UmkmOrgPreviewDialog";

// ── Helper logo ───────────────────────────────────────────────────────────────
function getOrganizationLogo(org: any): string | null {
  const image = [org.logo_url, org.logo, org.image, org.photo, org.organization_logo]
    .find((item) => item && typeof item === "string");
  if (!image) return null;
  if (image.startsWith("http")) return image;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "");
  return `${base}${image}`;
}

// ── Komponen ──────────────────────────────────────────────────────────────────
export function UmkmOrganizationView() {
  const t = useTranslations("UmkmOrganizationView");
  const tc = useTranslations("DashboardCommon");
  const {
    organizations,
    loading,
    searchTerm, setSearchTerm,
    searchBy, setSearchBy,          // ← pastikan hook expose ini
    typeFilter, setTypeFilter,      // ← pastikan hook expose ini
    currentPage, setCurrentPage,
    totalPages, totalRecords,
    isModalOpen, setIsModalOpen,
    isPreviewOpen, setIsPreviewOpen,
    editingOrg, previewOrg,
    submitting,
    deleteConfirmId, setDeleteConfirmId,
    form, onSubmit, handleDelete,
    status, setStatus,
    openCreate,
    openEdit,
    openPreview,
  } = useUmkmOrganizations();

  // ── Sort (client-side karena data sudah dipaginasi dari hook) ─────────────
  const [sortKey, setSortKey]       = React.useState("name");
  const [sortOrder, setSortOrder]   = React.useState<"asc" | "desc">("asc");

  const handleSort = React.useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  const sortedOrganizations = React.useMemo(() => {
    return [...organizations].sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortKey === "pic") {
        valA = String(a.pic_name || "").toLowerCase();
        valB = String(b.pic_name || "").toLowerCase();
      } else if (sortKey === "status") {
        valA = String(a.is_active);
        valB = String(b.is_active);
      } else {
        valA = String(a[sortKey] || "").toLowerCase();
        valB = String(b[sortKey] || "").toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ?  1 : -1;
      return 0;
    });
  }, [organizations, sortKey, sortOrder]);

  // ── Options ───────────────────────────────────────────────────────────────
  const searchOptions = [
    { value: "all",  label: "Semua kolom" },
    { value: "name", label: "Nama organisasi" },
  ];

  const typeOptions = [
    { value: "all",        label: "Semua tipe" },
    { value: "upt",        label: "Unit pengelola" },
    { value: "umkm_group", label: "IKM / UMKM" },
  ];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardPageShell
      title={t("manajemen_organisasi")}
      subtitle={t("kelola_data_unit_pengelola_upt")}
      icon={Store}
      actions={
        <Button onClick={openCreate} className="h-11 gap-2 rounded-xl font-semibold">
          <Plus className="h-4 w-4" />
          {t("tambah_organisasi")}
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("cari_organisasi")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy ?? "all"}
                onOptionChange={(v) => setSearchBy?.(v)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("tipe")}
                  options={typeOptions}
                  value={typeFilter ?? "all"}
                  onChange={(v) => setTypeFilter?.(v)}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${totalRecords} hasil untuk "${searchTerm}"`
                  : `Total ${totalRecords} organisasi terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_data_organisasi")} />
          ) : totalRecords === 0 ? (
            <EmptyState
              icon={Store}
              title={t("tidak_ada_organisasi")}
              description={t("belum_ada_data_organisasi_umkm")}
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <SortableHeader label={t("label_organisasi")}        sortKey="name"   currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("label_penanggung_jawab")}  sortKey="pic"    currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell>{t("kontak")}</AdminTableHeadCell>
                    <SortableHeader label={t("label_status")}            sortKey="status" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {sortedOrganizations.map((org) => (
                    <AdminTableRow key={`${org.type}-${org.id}`}>

                      {/* Organisasi */}
                      <AdminTableCell>
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                            {getOrganizationLogo(org) ? (
                              <img
                                src={getOrganizationLogo(org)!}
                                alt={org.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                Org
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground max-w-[180px]">
                              {org.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {org.display_type}
                            </p>
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Penanggung Jawab */}
                      <AdminTableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {org.pic_name || "—"}
                          </p>
                          {org.pic_phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 text-primary shrink-0" />
                              {org.pic_phone}
                            </div>
                          )}
                        </div>
                      </AdminTableCell>

                      {/* Kontak */}
                      <AdminTableCell>
                        <div className="space-y-1.5">
                          {org.email ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate max-w-[180px]">{org.email}</span>
                            </div>
                          ) : null}
                          {org.address ? (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="line-clamp-2 max-w-[220px]">{org.address}</span>
                            </div>
                          ) : null}
                          {!org.email && !org.address && (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </AdminTableCell>

                      {/* Status */}
                      <AdminTableCell>
                        <StatusBadge
                          type="status"
                          value={org.is_active ? "active" : "inactive"}
                        />
                      </AdminTableCell>

                      {/* Aksi */}
                      <AdminTableCell align="right">
                        <div className="flex justify-end gap-1">
                          <a href={`/admin/organizations/${org.id}`}>
                            <AdminIconButton title={t("lihat_detail")} tone="default">
                              <Eye className="h-4 w-4" />
                            </AdminIconButton>
                          </a>
                          <AdminIconButton onClick={() => openEdit(org)} title={t("edit")} tone="primary">
                            <Pencil className="h-4 w-4" />
                          </AdminIconButton>
                          <AdminIconButton onClick={() => setDeleteConfirmId(org.id)} title={t("hapus")} tone="destructive">
                            <Trash2 className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            </div>
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
          onSubmit={onSubmit}
          isSubmitting={submitting}
          onClose={() => setIsModalOpen(false)}
          editingOrg={editingOrg}
          t={t}
          tc={tc}
        />
      )}

      {isPreviewOpen && previewOrg && (
        <UmkmOrgPreviewDialog
          organization={previewOrg}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title={t("hapus_organisasi")}
          description={t("seluruh_data_yang_terhubung_de")}
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