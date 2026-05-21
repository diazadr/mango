"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import {
  Calendar, Loader2, Clock, Video, Users,
  MapPin, Building2, GraduationCap, ChevronRight, Tag,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";
import {
  AdminDataCard, AdminToolbar, AdminSearchFilter,
  AdminSelectFilter, AdminPagination,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";

// ── Status maps ───────────────────────────────────────────────────────────────
const SESSION_STATUS: Record<string, { label: string; className: string }> = {
  scheduled:  { label: "Terjadwal",  className: "bg-primary/10 text-primary border-primary/20" },
  done:       { label: "Selesai",    className: "bg-success/10 text-success border-success/20" },
  cancelled:  { label: "Dibatalkan", className: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show:    { label: "No Show",    className: "bg-warning/10 text-warning border-warning/20" },
  completed:  { label: "Selesai",    className: "bg-success/10 text-success border-success/20" },
};

const REQUEST_STATUS: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",    className: "bg-warning/10 text-warning border-warning/20" },
  assigned:  { label: "Ditugaskan", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ongoing:   { label: "Berjalan",   className: "bg-primary/10 text-primary border-primary/20" },
  done:      { label: "Selesai",    className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const STATUS_OPTIONS = [
  { value: "all",       label: "Semua Status" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "done",      label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "no_show",   label: "No Show" },
];

const PER_PAGE = 10;

interface Session {
  id: number;
  scheduled_at: string;
  duration_minutes: number | null;
  medium: string;
  status: string;
  meeting_link?: string | null;
  location?: string | null;
  consultation_request?: {
    id: number;
    topic: string;
    status: string;
    umkm?: { name: string };
  };
  notes?: any[];
}

export function AdvisorScheduleView() {
  const t = useTranslations("AdvisorScheduleView");
  const router = useRouter();

  const [sessions, setSessions]     = useState<Session[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey]       = useState("scheduled_at");
  const [sortOrder, setSortOrder]   = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch all mentoring requests then extract sessions ────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/v1/mentoring/requests", {
        params: { per_page: 100 },
      });

      // Flatten all sessions from all requests
      const requests: any[] = res.data?.data?.data || res.data?.data || res.data || [];
      const flat: Session[] = [];

      if (Array.isArray(requests)) {
        for (const req of requests) {
          if (Array.isArray(req.sessions)) {
            for (const sess of req.sessions) {
              flat.push({
                ...sess,
                consultation_request: {
                  id:     req.id,
                  topic:  req.topic,
                  status: req.status,
                  umkm:   req.umkm,
                },
              });
            }
          }
        }
      }

      setSessions(flat);
    } catch (err: any) {
      console.error("Gagal mengambil jadwal sesi:", err);
      setError(err.response?.data?.message || "Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortKey, sortOrder]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) { setSortOrder((o) => (o === "asc" ? "desc" : "asc")); return prev; }
      setSortOrder("asc");
      return key;
    });
  }, []);

  // ── Filter + sort + paginate ──────────────────────────────────────────────
  const processed = useMemo(() => {
    let result = [...sessions];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.consultation_request?.umkm?.name || "").toLowerCase().includes(q) ||
          (s.consultation_request?.topic || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    result.sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortKey === "scheduled_at") {
        valA = a.scheduled_at || "";
        valB = b.scheduled_at || "";
      } else if (sortKey === "umkm") {
        valA = a.consultation_request?.umkm?.name || "";
        valB = b.consultation_request?.umkm?.name || "";
      } else if (sortKey === "status") {
        valA = a.status || "";
        valB = b.status || "";
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [sessions, searchTerm, statusFilter, sortKey, sortOrder]);

  const totalPages  = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const paginated   = processed.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    done:      sessions.filter((s) => s.status === "done" || s.status === "completed").length,
  }), [sessions]);

  return (
    <DashboardPageShell
      title={t("title_jadwal_sesi")}
      subtitle={t("title_ringkasan_semua_sesi_mentoring_yang_dija")}
      icon={Calendar}
    >
      <div className="space-y-6">

        {/* ── Stat Cards ── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Sesi",    value: stats.total,     color: "text-foreground",  bg: "bg-muted/30" },
              { label: "Terjadwal",     value: stats.scheduled, color: "text-primary",     bg: "bg-primary/5" },
              { label: "Selesai",       value: stats.done,      color: "text-success",     bg: "bg-success/5" },
            ].map(({ label, value, color, bg }) => (
              <Card key={label} className={`border-border/50 shadow-sm rounded-xl ${bg}`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{label}</p>
                    <p className={`text-3xl font-black mt-0.5 ${color}`}>{value}</p>
                  </div>
                  <Calendar size={28} className={`${color} opacity-20`} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ── Table ── */}
        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("placeholder_cari_umkm_topik_lokasi")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_status_sesi")}
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
                {searchTerm || statusFilter !== "all"
                  ? `Ditemukan ${processed.length} sesi`
                  : `Total ${sessions.length} sesi mentoring`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_jadwal_sesi")} />
          ) : processed.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t("title_belum_ada_jadwal_sesi")}
              description={
                statusFilter !== "all" || searchTerm
                  ? "Tidak ada sesi yang sesuai dengan filter yang dipilih."
                  : "Belum ada sesi mentoring yang terdaftar untuk Anda."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <SortableHeader label={t("label_waktu")}     sortKey="scheduled_at" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("label_mitra_umkm")} sortKey="umkm"        currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell>{t("topik")}</AdminTableHeadCell>
                    <AdminTableHeadCell>{t("media")}</AdminTableHeadCell>
                    <SortableHeader label={t("label_status")}    sortKey="status"       currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {paginated.map((session) => {
                    const sessionS = SESSION_STATUS[session.status] ?? SESSION_STATUS.scheduled;
                    const scheduledDate = new Date(session.scheduled_at);
                    const isUpcoming = scheduledDate > new Date() && session.status === "scheduled";

                    return (
                      <AdminTableRow key={session.id}>
                        {/* Waktu */}
                        <AdminTableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className={`flex items-center gap-1.5 text-sm font-semibold ${isUpcoming ? "text-primary" : "text-foreground"}`}>
                              <Calendar size={13} className="shrink-0" />
                              {scheduledDate.toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock size={11} className="shrink-0" />
                              {scheduledDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                              {session.duration_minutes && (
                                <span className="text-muted-foreground/60">· {session.duration_minutes} menit</span>
                              )}
                            </div>
                          </div>
                        </AdminTableCell>

                        {/* UMKM */}
                        <AdminTableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Building2 size={13} />
                            </div>
                            <span className="font-medium text-foreground text-sm truncate max-w-[140px]">
                              {session.consultation_request?.umkm?.name || "—"}
                            </span>
                          </div>
                        </AdminTableCell>

                        {/* Topik */}
                        <AdminTableCell>
                          <div className="flex items-center gap-1.5">
                            <Tag size={12} className="text-primary shrink-0" />
                            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                              {session.consultation_request?.topic || "—"}
                            </span>
                          </div>
                        </AdminTableCell>

                        {/* Media */}
                        <AdminTableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            {session.medium === "online" ? (
                              <>
                                <Video size={13} className="text-blue-500" />
                                <span className="text-muted-foreground">{t("online")}</span>
                                {session.meeting_link && (
                                  <a
                                    href={session.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary font-bold hover:underline ml-1"
                                  >
                                    Buka Link
                                  </a>
                                )}
                              </>
                            ) : (
                              <>
                                <Users size={13} className="text-primary" />
                                <span className="text-muted-foreground">{t("offline")}</span>
                                {session.location && (
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70 ml-1">
                                    <MapPin size={9} /> {session.location}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </AdminTableCell>

                        {/* Status */}
                        <AdminTableCell>
                          <Badge className={`rounded-lg font-bold text-[10px] shadow-none border ${sessionS.className}`}>
                            {sessionS.label}
                          </Badge>
                        </AdminTableCell>

                        {/* Aksi */}
                        <AdminTableCell align="right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                            onClick={() =>
                              session.consultation_request?.id
                                ? router.push(`/workspace/advisor/mentoring/${session.consultation_request.id}`)
                                : undefined
                            }
                          >
                            Buka <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </AdminTableCell>
                      </AdminTableRow>
                    );
                  })}
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