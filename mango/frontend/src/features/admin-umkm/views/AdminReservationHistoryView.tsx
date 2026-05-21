"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History, Search, Wrench, Store, Building2, ChevronLeft, ChevronRight,
  Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, Eye, X
} from "lucide-react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import {
  AdminDataCard, AdminSearchFilter, AdminSelectFilter,
  AdminToolbar, AdminPagination, InitialsAvatar, AdminDialog, AdminIconButton
} from "@/src/components/ui/dashboard/AdminDataView";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "payment_submitted", label: "Bukti Bayar Dikirim" },
  { value: "payment_confirmed", label: "Pembayaran Dikonfirmasi" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "rejected", label: "Ditolak" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  payment_submitted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  payment_confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  payment_submitted: "Bukti Terkirim",
  payment_confirmed: "Bayar Dikonfirmasi",
  active: "Aktif",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  rejected: "Ditolak",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(val?: number | null) {
  if (val == null) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export function AdminReservationHistoryView() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [alertStatus, setAlertStatus] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setCurrentPage(1), [debouncedSearch, statusFilter]);

  const fetchReservations = useCallback(() => {
    setLoading(true);
    api.get("/v1/machines/reservations/history", {
      params: {
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        per_page: 15,
        include_completed: true,
      },
    })
      .then((res) => {
        const data = res.data;
        setReservations(data.data ?? []);
        setTotalPages(data.last_page ?? 1);
        setTotalRecords(data.total ?? 0);
      })
      .catch((err) => {
        setAlertStatus({ type: "destructive", message: "Gagal memuat riwayat reservasi." });
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <DashboardPageShell
      title="Beranda Reservasi"
      subtitle="Pantau seluruh transaksi reservasi mesin dari semua UMKM di platform MANGO."
      icon={History}
    >
      <div className="space-y-6">
        <StatusAlert status={alertStatus} onDismiss={() => setAlertStatus(null)} />

        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Reservasi", value: totalRecords, icon: History, color: "text-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/50 bg-card p-4 flex items-center gap-4">
              <div className={`rounded-xl bg-muted/30 p-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder="Cari UMKM, mesin..."
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
                  ? `${totalRecords} reservasi ditemukan untuk "${debouncedSearch}"`
                  : `Total ${totalRecords} reservasi`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat riwayat reservasi..." />
          ) : reservations.length === 0 ? (
            <EmptyState
              icon={History}
              title="Belum ada reservasi"
              description="Tidak ada reservasi yang cocok dengan filter saat ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHeadCell>UMKM Pemohon</AdminTableHeadCell>
                    <AdminTableHeadCell>Mesin</AdminTableHeadCell>
                    <AdminTableHeadCell>Waktu Penggunaan</AdminTableHeadCell>
                    <AdminTableHeadCell>Durasi</AdminTableHeadCell>
                    <AdminTableHeadCell>Harga</AdminTableHeadCell>
                    <AdminTableHeadCell>Status</AdminTableHeadCell>
                    <AdminTableHeadCell>Dibuat</AdminTableHeadCell>
                    <AdminTableHeadCell>Aksi</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {reservations.map((res) => (
                    <AdminTableRow key={res.id}>
                      {/* UMKM */}
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={res.requester_umkm?.name || "UMKM"} imageUrl={res.requester_umkm?.logo_url} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                              {res.requester_umkm?.name || "—"}
                            </p>
                            {res.requester_user && (
                              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                {res.requester_user.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Machine */}
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/50">
                            {res.machine?.image_url && !res.machine?.image_url.includes('placeholders') ? (
                              <img src={res.machine.image_url} alt={res.machine.name} className="w-full h-full object-cover" />
                            ) : (
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[130px]">
                              {res.machine?.name || "—"}
                            </p>
                            {res.machine?.owner && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                                <InitialsAvatar 
                                  name={res.machine.owner.name} 
                                  imageUrl={res.machine.owner.logo_url} 
                                  className="w-4 h-4 text-[8px]" 
                                />
                                <span className="text-[10px] font-medium truncate max-w-[120px]">
                                  {res.machine.owner.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Time */}
                      <AdminTableCell>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Calendar size={11} />
                            <span>{formatDate(res.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>
                              {res.start_time
                                ? new Date(res.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                                : "—"}
                              {res.end_time
                                ? ` – ${new Date(res.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Duration */}
                      <AdminTableCell>
                        <span className="text-sm font-medium text-foreground">
                          {res.duration_hours != null ? `${Number(res.duration_hours).toFixed(1)} jam` : "—"}
                        </span>
                      </AdminTableCell>

                      {/* Price */}
                      <AdminTableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(res.quoted_price)}
                          </p>
                          {res.payment_status && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${
                              res.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {res.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                            </span>
                          )}
                        </div>
                      </AdminTableCell>

                      {/* Status */}
                      <AdminTableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[res.status] || "bg-muted text-muted-foreground"}`}>
                          {STATUS_LABELS[res.status] || res.status}
                        </span>
                      </AdminTableCell>

                      {/* Created At */}
                      <AdminTableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(res.created_at)}
                        </span>
                      </AdminTableCell>

                      {/* Action */}
                      <AdminTableCell>
                        <AdminIconButton onClick={() => setSelectedReservation(res)} title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </AdminIconButton>
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

      {/* Simple Detail Modal */}
      {selectedReservation && (
        <AdminDialog size="md">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/5">
            <h3 className="font-semibold text-foreground">Detail Ringkas Reservasi</h3>
            <AdminIconButton onClick={() => setSelectedReservation(null)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </AdminIconButton>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-2">UMKM Pemohon</p>
                <div className="flex items-center gap-3 mb-2">
                  <InitialsAvatar name={selectedReservation.requester_umkm?.name || "UMKM"} imageUrl={selectedReservation.requester_umkm?.logo_url} className="w-8 h-8" />
                  <p className="font-medium text-foreground">{selectedReservation.requester_umkm?.name || "—"}</p>
                </div>
                {selectedReservation.requester_user && (
                  <div className="flex items-center gap-2 mt-2">
                    <InitialsAvatar name={selectedReservation.requester_user.name} imageUrl={selectedReservation.requester_user.avatar_url} className="w-5 h-5 text-[9px]" />
                    <p className="text-xs text-muted-foreground">{selectedReservation.requester_user.name}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Mesin & Penyedia</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/50">
                    {selectedReservation.machine?.image_url && !selectedReservation.machine?.image_url.includes('placeholders') ? (
                      <img src={selectedReservation.machine.image_url} alt={selectedReservation.machine.name} className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="font-medium text-foreground">{selectedReservation.machine?.name || "—"}</p>
                </div>
                {selectedReservation.machine?.owner && (
                  <div className="flex items-center gap-2 mt-2">
                    <InitialsAvatar name={selectedReservation.machine.owner.name} imageUrl={selectedReservation.machine.owner.logo_url} className="w-5 h-5 text-[9px]" />
                    <p className="text-xs text-muted-foreground">{selectedReservation.machine.owner.name}</p>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Jadwal</p>
                <p className="font-medium text-foreground">{formatDate(selectedReservation.start_time)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedReservation.start_time ? new Date(selectedReservation.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  {selectedReservation.end_time ? ` - ${new Date(selectedReservation.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Harga & Pembayaran</p>
                <p className="font-medium text-foreground">{formatCurrency(selectedReservation.quoted_price)}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">Status: {selectedReservation.payment_status === "paid" ? "Lunas" : "Belum Lunas"}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">Tujuan Reservasi</p>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm text-foreground whitespace-pre-wrap">
                {selectedReservation.purpose || "Tidak ada keterangan tujuan."}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
               <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[selectedReservation.status] || "bg-muted text-muted-foreground"}`}>
                  Status Akhir: {STATUS_LABELS[selectedReservation.status] || selectedReservation.status}
               </span>
            </div>
          </div>
        </AdminDialog>
      )}
    </DashboardPageShell>
  );
}
