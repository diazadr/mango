"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import {
  Briefcase, ChevronLeft, Calendar, Clock,
  CheckCircle2, Circle, Plus, Pencil, Trash2,
  Send, Save, FileText, Download, AlertCircle,
  StickyNote, Loader2, X, GraduationCap,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { format } from "date-fns";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/src/components/ui/dialog";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";

// ── Status helpers ─────────────────────────────────────────────────────────────
const PROJECT_STATUS: Record<string, string> = {
  active:    "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const PROJECT_STATUS_LABEL: Record<string, string> = {
  active:    "Aktif",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getActionPlans(iteration: any): any[] {
  return iteration.action_plans || iteration.actionPlans || [];
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ProjectDetailView() {
  const t = useTranslations("ProjectDetailView");
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();

  const type = pathname.includes("/workspace/advisor") ? "advisor" : "umkm";

  // ── Data ──
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  // ── Note ──
  const [newNote, setNewNote]             = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // ── Dialogs ──
  const [isIterationDialogOpen,  setIsIterationDialogOpen]  = useState(false);
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [isDeliverableDialogOpen, setIsDeliverableDialogOpen] = useState(false);

  const [selectedIterationId,  setSelectedIterationId]  = useState<number | null>(null);
  const [selectedActionPlanId, setSelectedActionPlanId] = useState<number | null>(null);
  const [editingIteration, setEditingIteration]         = useState<any>(null);
  const [isSubmitting, setIsSubmitting]                 = useState(false);

  const [iterationForm, setIterationForm]     = useState({ name: "", order: 1 });
  const [actionPlanForm, setActionPlanForm]   = useState({ title: "", description: "", due_date: "" });
  const [deliverableForm, setDeliverableForm] = useState({ title: "", description: "", url: "" });
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/projects/${params.id}`);
      setProject(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal mengambil detail proyek:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Progress ───────────────────────────────────────────────────────────────
  const calculateProgress = () => {
    if (!project?.iterations?.length) return 0;
    let total = 0, done = 0;
    project.iterations.forEach((it: any) => {
      getActionPlans(it).forEach((ap: any) => {
        total++;
        if (ap.status === "done") done++;
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    setStatus(null);
    try {
      await api.post(`/v1/projects/${project.id}/notes`, { content: newNote });
      setNewNote("");
      setStatus({ type: "success", message: t("msg_catatan_berhasil_ditambahkan") });
      fetchData();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menambahkan catatan." });
    } finally {
      setSubmittingNote(false);
    }
  };

  const toggleActionPlanStatus = async (plan: any) => {
    setStatus(null);
    try {
      const newStatus = plan.status === "done" ? "todo" : "done";
      await api.put(`/v1/action-plans/${plan.id}`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal memperbarui status." });
    }
  };

  const handleCreateIteration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingIteration) {
        await api.put(`/v1/iterations/${editingIteration.id}`, {
          name: iterationForm.name,
          order: editingIteration.order,
          status: editingIteration.status,
        });
        setStatus({ type: "success", message: t("msg_tahapan_berhasil_diperbarui") });
      } else {
        await api.post(`/v1/projects/${params.id}/iterations`, { ...iterationForm, status: "planned" });
        setStatus({ type: "success", message: t("msg_tahapan_berhasil_ditambahkan") });
      }
      setIsIterationDialogOpen(false);
      setEditingIteration(null);
      setIterationForm({ name: "", order: (project?.iterations?.length || 0) + 1 });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIteration = async (iterationId: number) => {
    if (!confirm(t("confirm_hapus_tahapan_ini_beserta_semua_tugasnya"))) return;
    try {
      await api.delete(`/v1/iterations/${iterationId}`);
      setStatus({ type: "success", message: t("msg_tahapan_berhasil_dihapus") });
      fetchData();
    } catch {
      setStatus({ type: "destructive", message: t("msg_gagal_menghapus_tahapan") });
    }
  };

  const handleCreateActionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIterationId) return;
    setIsSubmitting(true);
    setStatus(null);
    try {
      await api.post(`/v1/iterations/${selectedIterationId}/action-plans`, {
        ...actionPlanForm,
        status: "todo",
      });
      setIsActionPlanDialogOpen(false);
      setActionPlanForm({ title: "", description: "", due_date: "" });
      setStatus({ type: "success", message: t("msg_tugas_baru_berhasil_ditambahkan") });
      fetchData();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menambahkan tugas." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionPlanId) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", deliverableForm.title);
    formData.append("description", deliverableForm.description);
    formData.append("url", deliverableForm.url);
    if (deliverableFile) formData.append("file", deliverableFile);
    try {
      await api.post(`/v1/action-plans/${selectedActionPlanId}/deliverables`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsDeliverableDialogOpen(false);
      setDeliverableForm({ title: "", description: "", url: "" });
      setDeliverableFile(null);
      setStatus({ type: "success", message: t("msg_laporan_berhasil_dikirim") });
      fetchData();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal mengirim laporan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    try {
      await api.put(`/v1/projects/${params.id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const progress = project ? calculateProgress() : 0;

  // ── Loading / not found ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <LoadingState message={t("message_memuat_detail_proyek")} />
      </div>
    );
  }

  if (!project) {
    return (
      <DashboardPageShell title={t("title_proyek_tidak_ditemukan")} subtitle={t("title_error_404")} icon={Briefcase}>
        <EmptyState
          icon={AlertCircle}
          title={t("title_proyek_tidak_ditemukan_1")}
          description={t("description_proyek_tidak_ditemukan_atau_anda_tidak_m")}
        />
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ChevronLeft size={16} /> Kembali ke Daftar
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={project.name}
      subtitle={`${project.umkm?.name ? `${project.umkm.name} · ` : ""}Proyek ${project.type}`}
      icon={Briefcase}
      actions={
        type === "advisor" ? (
          <div className="flex gap-2">
            {project.consultation_request_id && (
              <Button
                variant="outline"
                className="gap-2 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary"
                onClick={() => router.push(`/workspace/advisor/mentoring/${project.consultation_request_id}`)}
              >
                <GraduationCap size={16} /> Buka Pendampingan
              </Button>
            )}
            {project.status !== "completed" ? (
              <Button
                className="gap-2 bg-success hover:bg-success/90"
                onClick={() => handleUpdateProjectStatus("completed")}
              >
                <CheckCircle2 size={16} /> Selesaikan Proyek
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleUpdateProjectStatus("active")}
              >
                <Clock size={16} /> Re-aktifkan
              </Button>
            )}
            <Button className="gap-2" onClick={() => setIsIterationDialogOpen(true)}>
              <Plus size={16} /> Tambah Tahapan
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Back */}
        <Button
          variant="ghost"
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft size={16} /> Kembali ke Daftar
        </Button>

        {/* Status alert */}
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {/* ── Progress Card ── */}
        <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Progress Keseluruhan
                </p>
                <p className="text-3xl font-black text-primary">{progress}%</p>
              </div>
              <Badge
                className={`rounded-md text-[10px] font-semibold border ${
                  PROJECT_STATUS[project.status] ?? "bg-muted text-muted-foreground border-border"
                }`}
              >
                {PROJECT_STATUS_LABEL[project.status] ?? project.status}
              </Badge>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              {project.started_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-primary" />
                  Mulai: {new Date(project.started_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              {project.ended_at && (
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" />
                  Target: {new Date(project.ended_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Kolom Kiri: Iterasi & Action Plans ── */}
          <div className="lg:col-span-2 space-y-6">
            {!project.iterations?.length ? (
              <EmptyState
                icon={Briefcase}
                title={t("title_belum_ada_tahapan")}
                description={t("description_belum_ada_tahapan_aksi_dalam_proyek_ini")}
              />
            ) : (
              project.iterations.map((iteration: any, index: number) => {
                const plans = getActionPlans(iteration);
                const donePlans = plans.filter((p: any) => p.status === "done").length;

                return (
                  <section key={iteration.id} className="space-y-3">

                    {/* Iteration header */}
                    <div className="flex items-center justify-between bg-muted/30 border border-border/50 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{iteration.name}</h3>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                            {iteration.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-md text-[10px] font-semibold border-border/50">
                          {donePlans}/{plans.length} tugas
                        </Badge>

                        {type === "advisor" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                              title={t("title_tambah_tugas")}
                              onClick={() => {
                                setSelectedIterationId(iteration.id);
                                setIsActionPlanDialogOpen(true);
                              }}
                            >
                              <Plus size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                              title={t("title_edit_tahapan")}
                              onClick={() => {
                                setEditingIteration(iteration);
                                setIterationForm({ name: iteration.name, order: iteration.order });
                                setIsIterationDialogOpen(true);
                              }}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                              title={t("title_hapus_tahapan")}
                              onClick={() => handleDeleteIteration(iteration.id)}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Plans */}
                    <div className="space-y-2 pl-4 border-l-2 border-dashed border-primary/20 ml-4">
                      {!plans.length ? (
                        <p className="text-xs text-muted-foreground italic py-2 pl-2">
                          Belum ada tugas di tahapan ini.
                        </p>
                      ) : (
                        plans.map((plan: any) => (
                          <div
                            key={plan.id}
                            className="flex items-start gap-3 p-4 bg-card border border-border/50 rounded-xl shadow-sm hover:border-primary/30 transition-all"
                          >
                            {/* Checkbox toggle */}
                            <button
                              onClick={() => toggleActionPlanStatus(plan)}
                              className={`mt-0.5 transition-colors shrink-0 ${
                                plan.status === "done"
                                  ? "text-success"
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            >
                              {plan.status === "done"
                                ? <CheckCircle2 size={20} />
                                : <Circle size={20} />}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1.5">
                              <p className={`font-semibold text-sm ${
                                plan.status === "done"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}>
                                {plan.title}
                              </p>

                              {plan.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {plan.description}
                                </p>
                              )}

                              {/* Deliverables */}
                              {plan.deliverables?.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  <p className="text-[10px] font-bold text-primary/60 tracking-wide">
                                    Laporan/Output
                                  </p>
                                  {plan.deliverables.map((d: any) => (
                                    <div
                                      key={d.id}
                                      className="flex items-center justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/10"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={13} className="text-primary shrink-0" />
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold truncate">{d.title}</p>
                                          {d.description && (
                                            <p className="text-[10px] text-muted-foreground truncate">
                                              {d.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {d.file_path && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg shrink-0" asChild>
                                          <a
                                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/storage/${d.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Download size={13} />
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Meta row */}
                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                {plan.due_date && (
                                  <span className="text-[10px] font-semibold flex items-center gap-1 text-muted-foreground">
                                    <Calendar size={10} className="text-primary" />
                                    {new Date(plan.due_date).toLocaleDateString("id-ID", {
                                      day: "numeric", month: "short", year: "numeric",
                                    })}
                                  </span>
                                )}
                                {type === "umkm" && plan.status !== "done" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-[10px] font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                                    onClick={() => {
                                      setSelectedActionPlanId(plan.id);
                                      setIsDeliverableDialogOpen(true);
                                    }}
                                  >
                                    <Plus size={11} /> Kirim Laporan
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                );
              })
            )}
          </div>

          {/* ── Kolom Kanan: Catatan ── */}
          <div className="space-y-4">
            <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 p-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <StickyNote size={15} className="text-primary" />
                  Catatan Proyek
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 max-h-[420px] overflow-y-auto">
                {!project.notes?.length ? (
                  <div className="p-8 text-center text-muted-foreground text-xs italic">
                    Belum ada catatan.
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {project.notes.map((note: any) => (
                      <div key={note.id} className="p-4 space-y-1.5">
                        <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
                        <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>{note.user?.name}</span>
                          <span>
                            {new Date(note.created_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 border-t border-border/50 bg-muted/10">
                <form onSubmit={handleAddNote} className="w-full flex gap-2">
                  <Input
                    placeholder={type === "umkm" ? "Tulis feedback Anda..." : "Tambah catatan..."}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="h-10 text-sm flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    disabled={submittingNote || !newNote.trim()}
                  >
                    {submittingNote
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Send size={14} />}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* ════════════ DIALOGS ════════════ */}

      {/* Iteration Dialog */}
      <Dialog
        open={isIterationDialogOpen}
        onOpenChange={(open) => {
          setIsIterationDialogOpen(open);
          if (!open) { setEditingIteration(null); setIterationForm({ name: "", order: 1 }); }
        }}
      >
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Briefcase size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {editingIteration ? "Edit Tahapan" : "Tambah Tahapan Aksi"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Gunakan tahapan untuk membagi proyek menjadi beberapa fase.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateIteration}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("nama_tahapan")}</Label>
                <Input
                  value={iterationForm.name}
                  onChange={(e) => setIterationForm({ ...iterationForm, name: e.target.value })}
                  placeholder={t("placeholder_contoh_analisis_kebutuhan")}
                  required
                  className="h-10 text-sm"
                />
              </div>
            </CardContent>
            <DialogFooter className="p-6 pt-0 gap-2">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={() => setIsIterationDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 gap-2 font-semibold">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Simpan Tahapan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Action Plan Dialog */}
      <Dialog open={isActionPlanDialogOpen} onOpenChange={setIsActionPlanDialogOpen}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Plus size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{t("tambah_tugas_baru")}</DialogTitle>
                <DialogDescription className="text-xs">
                  Detail langkah kerja yang harus dilakukan dalam tahapan ini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateActionPlan}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("judul_tugas")}</Label>
                <Input
                  value={actionPlanForm.title}
                  onChange={(e) => setActionPlanForm({ ...actionPlanForm, title: e.target.value })}
                  placeholder={t("placeholder_apa_yang_perlu_dilakukan")}
                  required
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("deskripsi_opsional")}</Label>
                <Textarea
                  value={actionPlanForm.description}
                  onChange={(e) => setActionPlanForm({ ...actionPlanForm, description: e.target.value })}
                  className="text-sm min-h-[90px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("tenggat_waktu")}</Label>
                <DateTimePicker
                  value={actionPlanForm.due_date ? new Date(actionPlanForm.due_date) : null}
                  onChange={(d) => setActionPlanForm({ ...actionPlanForm, due_date: d ? format(d, 'yyyy-MM-dd') : "" })}
                  className="h-10 text-sm"
                />
              </div>
            </CardContent>
            <DialogFooter className="p-6 pt-0 gap-2">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={() => setIsActionPlanDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 gap-2 font-semibold">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Tambahkan Tugas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deliverable Dialog */}
      <Dialog open={isDeliverableDialogOpen} onOpenChange={setIsDeliverableDialogOpen}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <FileText size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{t("kirim_laporan_tugas")}</DialogTitle>
                <DialogDescription className="text-xs">
                  Unggah laporan atau berikan tautan hasil kerja Anda.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitDeliverable}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("judul_laporan")}</Label>
                <Input
                  value={deliverableForm.title}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
                  placeholder={t("placeholder_contoh_laporan_survey_pasar")}
                  required
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("deskripsi_singkat")}</Label>
                <Textarea
                  value={deliverableForm.description}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                  className="text-sm min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("unggah_file_pdfgambar")}</Label>
                <Input
                  type="file"
                  onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("atau_link_eksternal")}</Label>
                <Input
                  value={deliverableForm.url}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, url: e.target.value })}
                  placeholder="https://..."
                  className="h-10 text-sm"
                />
              </div>
            </CardContent>
            <DialogFooter className="p-6 pt-0 gap-2">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={() => setIsDeliverableDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-10 gap-2 font-semibold">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Kirim Laporan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}