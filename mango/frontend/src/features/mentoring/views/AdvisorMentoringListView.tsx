"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import {
  GraduationCap, MessageSquare, Loader2,
  User, Tag, FileText, Calendar, Eye,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";
import {
  AdminDataCard, AdminToolbar, AdminSearchFilter,
  AdminSelectFilter, AdminIconButton, AdminPagination,
  EmptyState,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { useTranslations } from "next-intl";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/src/components/ui/dialog";

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active:    { label: "Aktif",     className: "bg-success/10 text-success border-success/20" },
  pending:   { label: "Pending",   className: "bg-warning/10 text-warning border-warning/20" },
  completed: { label: "Selesai",   className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Dibatalkan",className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function TaskStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, className: "bg-muted/30 text-muted-foreground border-border" };
  return (
    <Badge className={`rounded-lg font-bold text-[10px] shadow-none border capitalize ${s.className}`}>
      {s.label}
    </Badge>
  );
}

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function TaskDetailDialog({ task, onClose, onNavigate }: { task: any; onClose: () => void; onNavigate: (id: number) => void }) {
  const t = useTranslations("AdvisorMentoringListView");
  if (!task) return null;
  const s = STATUS_MAP[task.status] ?? STATUS_MAP.pending;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
        <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={18} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {task.umkm?.name || "Mitra UMKM"}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Detail sesi mentoring
                </DialogDescription>
              </div>
            </div>
            <Badge className={`rounded-lg font-bold text-[10px] shadow-none border ${s.className}`}>
              {s.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Topik */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <Tag size={14} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("topik")}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{task.topic || "—"}</p>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <FileText size={14} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("deskripsi")}</p>
              <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">
                {task.description || "Tidak ada deskripsi."}
              </p>
            </div>
          </div>

          {/* Pemilik UMKM */}
          {task.umkm?.owner_name && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
              <User size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("pemilik")}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{task.umkm.owner_name}</p>
              </div>
            </div>
          )}

          {/* Tanggal */}
          {task.created_at && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
              <Calendar size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("dibuat")}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(task.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <Button
            className="w-full h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 gap-2"
            onClick={() => {
              onClose();
              onNavigate(task.id);
            }}
          >
            <MessageSquare size={16} /> Buka Sesi Mentoring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdvisorMentoringListView() {
  const t = useTranslations("AdvisorMentoringListView");
  const router = useRouter();

  const [tasks, setTasks]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey]       = useState("umkm");
  const [sortOrder, setSortOrder]   = useState<"asc" | "desc">("asc");
  const [previewTask, setPreviewTask] = useState<any>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/mentoring/requests");
      setTasks(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch mentoring tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Sort handler ────────────────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  // ── Filter + Sort ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !searchTerm ||
          (t.umkm?.name || "").toLowerCase().includes(q) ||
          (t.topic || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || t.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let valA = "";
        let valB = "";
        if (sortKey === "umkm")   { valA = a.umkm?.name || ""; valB = b.umkm?.name || ""; }
        else if (sortKey === "status") { valA = a.status || ""; valB = b.status || ""; }
        else { valA = String(a[sortKey] || ""); valB = String(b[sortKey] || ""); }
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ?  1 : -1;
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, sortKey, sortOrder]);

  const statusOptions = [
    { value: "all",       label: "Semua Status" },
    { value: "active",    label: "Aktif" },
    { value: "pending",   label: "Pending" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ];

  return (
    <DashboardPageShell
      title={t("title_tugas_mentoring")}
      subtitle={t("title_kelola_bimbingan_dan_konsultasi_aktif_de")}
      icon={GraduationCap}
    >
      <div className="space-y-6">
        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("placeholder_cari_umkm_topik_deskripsi")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_status")}
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${filtered.length} hasil untuk "${searchTerm}"`
                  : `Total ${tasks.length} tugas mentoring`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_tugas_mentoring")} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={t("title_belum_ada_tugas_mentoring")}
              description={t("description_belum_ada_tugas_mentoring_yang_ditugaska")}
            />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <SortableHeader label={t("label_mitra_umkm")} sortKey="umkm"   currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("label_topik")}      sortKey="topic"  currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell>{t("deskripsi_1")}</AdminTableHeadCell>
                    <SortableHeader label={t("label_status_1")}     sortKey="status" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {filtered.map((task) => (
                    <AdminTableRow key={task.id}>

                      {/* Mitra UMKM */}
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                            {(() => {
                              const photo = task.umkm?.logo_url || task.umkm?.profile_photo_url || task.umkm?.image_url;
                              return photo && !photo.includes('placeholder') ? (
                                <img src={photo} alt={task.umkm?.name || 'UMKM'} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-primary">{(task.umkm?.name || '?').charAt(0).toUpperCase()}</span>
                              );
                            })()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[160px]">
                              {task.umkm?.name || "Mitra UMKM"}
                            </span>
                            {task.umkm?.owner_name && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <User size={9} /> {task.umkm.owner_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </AdminTableCell>

                      {/* Topik */}
                      <AdminTableCell>
                        <span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                          {task.topic || "—"}
                        </span>
                      </AdminTableCell>

                      {/* Deskripsi */}
                      <AdminTableCell>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-[260px] leading-relaxed">
                          {task.description || "—"}
                        </p>
                      </AdminTableCell>

                      {/* Status */}
                      <AdminTableCell>
                        <TaskStatusBadge status={task.status} />
                      </AdminTableCell>

                      {/* Aksi */}
                      <AdminTableCell align="right">
                        <div className="flex justify-end gap-1">
                          <AdminIconButton
                            onClick={() => setPreviewTask(task)}
                            title={t("title_lihat_detail")}
                            tone="default"
                          >
                            <Eye size={14} />
                          </AdminIconButton>
                          <AdminIconButton
                            onClick={() => router.push(`/workspace/advisor/mentoring/${task.id}`)}
                            title={t("title_buka_sesi")}
                            tone="primary"
                          >
                            <MessageSquare size={14} />
                          </AdminIconButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            </div>
          )}
        </AdminDataCard>
      </div>

      {/* Detail Dialog */}
      {previewTask && (
        <TaskDetailDialog
          task={previewTask}
          onClose={() => setPreviewTask(null)}
          onNavigate={(id) => router.push(`/workspace/advisor/mentoring/${id}`)}
        />
      )}
    </DashboardPageShell>
  );
}