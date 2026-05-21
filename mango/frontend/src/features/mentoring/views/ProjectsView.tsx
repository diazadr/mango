"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/src/lib/http/axios";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  Plus,
  ChevronRight,
  Calendar,
  Save,
  Building2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { CardContent } from "@/src/components/ui/card";
import { useRouter } from "@/src/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminToolbar,
  AdminSearchFilter,
  AdminSelectFilter,
  AdminPagination,
} from "@/src/components/ui/dashboard/AdminDataView";
import { useTranslations } from "next-intl";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "advisory", label: "Advisory" },
  { value: "training", label: "Training" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const PER_PAGE = 10;

export function ProjectsView({ type }: { type: "umkm" | "advisor" }) {
  const t = useTranslations("ProjectsView");
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Data state ──
  const [projects, setProjects] = useState<any[]>([]);
  const [umkms, setUmkms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    type: "success" | "destructive";
    message: string;
  } | null>(null);

  // ── Filter / sort / pagination ──
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dialog state ──
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "advisory",
    umkm_id: "",
    status: "active",
    started_at: "",
    ended_at: "",
  });

  // Auto-open dialog if umkm_id passed via query param
  useEffect(() => {
    const qUmkmId = searchParams?.get("umkm_id");
    if (qUmkmId && type === "advisor") {
      setProjectForm((f) => ({ ...f, umkm_id: qUmkmId }));
      setCreateDialogOpen(true);
    }
  }, [searchParams, type]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      let url = "/v1/projects";

      if (type === "umkm") {
        const userRes = await api.get("/v1/me");
        const userData = userRes.data.data?.user || userRes.data.user;
        if (userData?.umkm) url += `?umkm_id=${userData.umkm.id}`;
      } else if (type === "advisor") {
        try {
          const mentRes = await api.get("/v1/mentoring/requests", {
            params: { per_page: 100 },
          });
          const requests: any[] =
            mentRes.data?.data?.data || mentRes.data?.data || mentRes.data || [];
          if (Array.isArray(requests)) {
            const umkmMap = new Map<number, any>();
            requests.forEach((req: any) => {
              if (req.umkm && !umkmMap.has(req.umkm.id)) {
                umkmMap.set(req.umkm.id, req.umkm);
              }
            });
            setUmkms(Array.from(umkmMap.values()));
          }
        } catch (uErr) {
          console.error("Gagal mengambil data UMKM pendampingan:", uErr);
        }
        url += "?per_page=100";
      }

      const res = await api.get(url);
      const responseData = res.data;
      const projectsArray =
        responseData.data?.data || responseData.data || responseData || [];

      if (Array.isArray(projectsArray)) {
        setProjects(projectsArray);
      } else if (
        projectsArray &&
        typeof projectsArray === "object" &&
        Array.isArray(projectsArray.data)
      ) {
        setProjects(projectsArray.data);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      setStatus({
        type: "destructive",
        message:
          err.response?.data?.message ||
          "Koneksi ke server bermasalah atau akses ditolak.",
      });
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, sortKey, sortOrder]);

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

  const processed = useMemo(() => {
    let result = [...projects];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.umkm?.name?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (typeFilter !== "all") result = result.filter((p) => p.type === typeFilter);

    result.sort((a, b) => {
      const valA = String(a[sortKey] ?? "").toLowerCase();
      const valB = String(b[sortKey] ?? "").toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, searchTerm, statusFilter, typeFilter, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const paginated = processed.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.post("/v1/projects", {
        ...projectForm,
        assessment_result_id: null,
        started_at: projectForm.started_at || null,
        ended_at: projectForm.ended_at || null,
      });
      setStatus({ type: "success", message: t("msg_proyek_berhasil_dibuat") });
      setCreateDialogOpen(false);
      setProjectForm({
        name: "",
        type: "advisory",
        umkm_id: "",
        status: "active",
        started_at: "",
        ended_at: "",
      });
      fetchData();
    } catch (err: any) {
      setStatus({
        type: "destructive",
        message: err.response?.data?.message || "Gagal membuat proyek.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title={t("title_proyek_pendampingan")}
      subtitle={t("title_kelola_rencana_aksi_dan_implementasi_sol")}
      icon={Briefcase}
      actions={
        type === "advisor" ? (
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Buat Proyek Baru
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("placeholder_cari_nama_proyek_atau_umkm")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_filter_status")}
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                <AdminSelectFilter
                  label={t("label_filter_tipe")}
                  options={TYPE_OPTIONS}
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${processed.length} hasil untuk "${searchTerm}"`
                  : `Total ${processed.length} proyek terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_daftar_proyek")} />
          ) : processed.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("title_tidak_ada_proyek")}
              description={
                searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tidak ada proyek yang sesuai dengan filter yang dipilih."
                  : "Belum ada proyek pendampingan yang berjalan."
              }
            />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader
                    label={t("label_nama_proyek")}
                    sortKey="name"
                    currentSort={sortKey}
                    direction={sortOrder}
                    onSort={handleSort}
                  />
                  <AdminTableHeadCell>{t("mitra_umkm")}</AdminTableHeadCell>
                  <SortableHeader
                    label={t("label_tipe")}
                    sortKey="type"
                    currentSort={sortKey}
                    direction={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t("label_mulai")}
                    sortKey="started_at"
                    currentSort={sortKey}
                    direction={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={t("label_selesai")}
                    sortKey="ended_at"
                    currentSort={sortKey}
                    direction={sortOrder}
                    onSort={handleSort}
                  />
                  <AdminTableHeadCell>{t("status")}</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {paginated.map((project) => (
                  <AdminTableRow key={project.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">
                          {project.name}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {project.umkm?.name || "—"}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm font-medium text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10 capitalize">
                        {project.type || "—"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {project.started_at
                          ? new Date(project.started_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {project.ended_at
                          ? new Date(project.ended_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge
                        className={`rounded-md text-[10px] font-semibold border ${
                          STATUS_BADGE[project.status] ??
                          "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {STATUS_LABEL[project.status] ?? project.status}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                        onClick={() =>
                          router.push(`/workspace/${type}/projects/${project.id}`)
                        }
                      >
                        Detail <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
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

      {/* ── Create Project Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Inisiasi Proyek Baru
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Buat proyek pendampingan aktif untuk mitra UMKM.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject}>
            <CardContent className="p-6 space-y-5">
              {/* Nama Proyek */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Nama Proyek
                </Label>
                <Input
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                  placeholder={t("placeholder_contoh_digitalisasi_operasional_umkm")}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Mitra UMKM */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Mitra UMKM
                </Label>
                <Select
                  value={projectForm.umkm_id}
                  onValueChange={(val) =>
                    setProjectForm({ ...projectForm, umkm_id: val })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder={t("placeholder_pilih_umkm")} />
                  </SelectTrigger>
                  <SelectContent>
                    {umkms.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipe Proyek */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Tipe Proyek
                </Label>
                <Select
                  value={projectForm.type}
                  onValueChange={(val) =>
                    setProjectForm({ ...projectForm, type: val })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advisory">{t("advisory")}</SelectItem>
                    <SelectItem value="training">{t("training")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="started_at"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Tanggal Mulai
                  </Label>
                  <DateTimePicker
                    value={projectForm.started_at ? new Date(projectForm.started_at) : null}
                    onChange={(d) =>
                      setProjectForm({ ...projectForm, started_at: d ? format(d, 'yyyy-MM-dd') : "" })
                    }
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="ended_at"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Target Selesai
                  </Label>
                  <DateTimePicker
                    value={projectForm.ended_at ? new Date(projectForm.ended_at) : null}
                    onChange={(d) =>
                      setProjectForm({ ...projectForm, ended_at: d ? format(d, 'yyyy-MM-dd') : "" })
                    }
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </CardContent>

            <DialogFooter className="p-6 pt-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 rounded-lg"
                onClick={() => setCreateDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 rounded-lg gap-2 font-semibold"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Buat Proyek
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}