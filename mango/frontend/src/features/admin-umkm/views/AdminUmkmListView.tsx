"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Store, Search, ChevronLeft, ChevronRight, Building2,
  User, ExternalLink, CheckCircle2, XCircle, TrendingUp, TrendingDown,
} from "lucide-react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import {
  AdminDataCard, AdminSearchFilter, AdminSelectFilter,
  AdminToolbar, AdminPagination,
} from "@/src/components/ui/dashboard/AdminDataView";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";

function formatRp(n: number | null | undefined) {
  if (!n) return "Rp 0";
  return "Rp " + Number(n).toLocaleString("id-ID");
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

export function AdminUmkmListView() {
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [status, setStatus] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setCurrentPage(1), [debouncedSearch, statusFilter]);

  const fetchUmkm = useCallback(() => {
    setLoading(true);
    api.get("/v1/admin/umkm", {
      params: {
        search: debouncedSearch || undefined,
        is_active: statusFilter === "all" ? undefined : statusFilter === "active" ? "1" : "0",
        page: currentPage,
        per_page: 15,
      },
    })
      .then((res) => {
        const data = res.data;
        setUmkmList(data.data ?? []);
        setTotalPages(data.last_page ?? 1);
        setTotalRecords(data.total ?? 0);
      })
      .catch((err) => {
        setStatus({ type: "destructive", message: "Gagal memuat daftar UMKM." });
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => { fetchUmkm(); }, [fetchUmkm]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Daftar Seluruh UMKM"
      subtitle="Pantau semua UMKM yang terdaftar di platform MANGO, termasuk informasi organisasi dan pengguna terkait."
      icon={Store}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder="Cari nama UMKM atau pemilik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {debouncedSearch
                  ? `Ditemukan ${totalRecords} UMKM untuk "${debouncedSearch}"`
                  : `Total ${totalRecords} UMKM terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat data UMKM..." />
          ) : umkmList.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Belum ada UMKM"
              description="Tidak ada UMKM yang cocok dengan filter saat ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHeadCell>Nama UMKM</AdminTableHeadCell>
                    <AdminTableHeadCell>Pemilik / User</AdminTableHeadCell>
                    <AdminTableHeadCell>Organisasi</AdminTableHeadCell>
                    <AdminTableHeadCell>Finansial (Reservasi)</AdminTableHeadCell>
                    <AdminTableHeadCell>Status</AdminTableHeadCell>
                    <AdminTableHeadCell>NIB</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {umkmList.map((umkm) => (
                    <AdminTableRow key={umkm.id}>
                      {/* UMKM Info */}
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-muted/20">
                            {(() => {
                              const photo = umkm.logo_url || umkm.profile_photo_url || umkm.image_url || umkm.photo;
                              return photo && !photo.includes("placeholder") ? (
                                <img src={photo} alt={umkm.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground bg-gradient-to-br from-primary/10 to-primary/20">
                                  {umkm.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{umkm.name}</p>
                            {umkm.legal_entity_type && (
                              <p className="text-xs text-muted-foreground">{umkm.legal_entity_type}</p>
                            )}
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Owner */}
                      <AdminTableCell>
                        {umkm.user ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">{umkm.user.name}</p>
                            <p className="text-xs text-muted-foreground">{umkm.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </AdminTableCell>

                      {/* Organization */}
                      <AdminTableCell>
                        {umkm.organization ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                              <CheckCircle2 size={10} />
                              Tergabung
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-primary shrink-0" />
                              <a
                                href={`/admin/organizations/${umkm.organization.id}`}
                                className="text-sm font-medium text-primary hover:underline truncate max-w-[140px]"
                              >
                                {umkm.organization.name}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/50">
                            <XCircle size={10} />
                            Belum Tergabung
                          </span>
                        )}
                      </AdminTableCell>

                      {/* Financial (Income/Expense) */}
                      <AdminTableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-success" title="Total Pendapatan (Income)">
                            <TrendingUp size={12} />
                            <span className="text-xs font-bold">{formatRp(umkm.total_income || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-destructive" title="Total Pengeluaran (Expense)">
                            <TrendingDown size={12} />
                            <span className="text-xs font-bold">{formatRp(umkm.total_expense || 0)}</span>
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Status */}
                      <AdminTableCell>
                        <StatusBadge type="status" value={umkm.is_active ? "active" : "inactive"} />
                      </AdminTableCell>

                      {/* NIB */}
                      <AdminTableCell>
                        <span className="text-xs font-mono text-muted-foreground">{umkm.nib || "—"}</span>
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
    </DashboardPageShell>
  );
}
