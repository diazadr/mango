"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import {
  GraduationCap, MessageSquare, Loader2, Calendar, Clock,
  User, Building2, ChevronLeft, Plus, Send, CheckCircle2,
  Video, Users, MapPin, Tag, FileText, AlertCircle, Briefcase, Save, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { id as localeId } from "date-fns/locale";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";

import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { useParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { useTranslations } from "next-intl";

// ── Status helpers ────────────────────────────────────────────────────────────
const REQUEST_STATUS: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",    className: "bg-warning/10 text-warning border-warning/20" },
  active:    { label: "Aktif",      className: "bg-primary/10 text-primary border-primary/20" },
  done:      { label: "Selesai",    className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const SESSION_STATUS: Record<string, { label: string; className: string }> = {
  scheduled:  { label: "Terjadwal",  className: "bg-primary/10 text-primary border-primary/20" },
  done:       { label: "Selesai",    className: "bg-success/10 text-success border-success/20" },
  cancelled:  { label: "Dibatalkan", className: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show:    { label: "No Show",    className: "bg-warning/10 text-warning border-warning/20" },
};

function StatusBadge({
  map,
  value,
}: {
  map: Record<string, { label: string; className: string }>;
  value: string;
}) {
  const s = map[value] ?? { label: value, className: "bg-muted/30 text-muted-foreground border-border" };
  return (
    <Badge className={`rounded-lg font-bold text-[10px] shadow-none border capitalize ${s.className}`}>
      {s.label}
    </Badge>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
      <Icon size={14} className="text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

const DEFAULT_SESSION_FORM = {
  scheduled_at: "",
  duration_minutes: "60",
  medium: "online",
  meeting_link: "",
  location: "",
};

// ── Main ──────────────────────────────────────────────────────────────────────
export function AdvisorMentoringDetailView() {
  const t = useTranslations("AdvisorMentoringDetailView");
  const params = useParams();
  const router = useRouter();

  const [request, setRequest]                     = useState<any>(null);
  const [loading, setLoading]                     = useState(true);
  const [actionStatus, setActionStatus]           = useState<{
    type: "success" | "destructive";
    message: string;
  } | null>(null);

  const [assessments, setAssessments] = useState<any[]>([]);

  // Project state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', type: 'advisory', started_at: '', ended_at: '' });

  // Generate chart data for radar comparison
  const radarData = React.useMemo(() => {
    if (assessments.length < 2) return [];
    const prev = assessments[assessments.length - 2];
    const curr = assessments[assessments.length - 1];
    if (!prev.chart_data || !curr.chart_data) return [];
    return prev.chart_data.map((prevItem: any) => {
      const currItem = curr.chart_data.find((c: any) => c.subject === prevItem.subject) || { score: 0 };
      return { subject: prevItem.subject, Sebelum: prevItem.score, Sesudah: currItem.score, fullMark: 5 };
    });
  }, [assessments]);

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [sessionForm, setSessionForm]             = useState(DEFAULT_SESSION_FORM);

  const [activeSession, setActiveSession]         = useState<any>(null);
  const [noteContent, setNoteContent]             = useState("");
  const [improvedCategories, setImprovedCategories] = useState<number[]>([]);
  const [submittingNote, setSubmittingNote]       = useState(false);
  const [assessmentCategories, setAssessmentCategories] = useState<any[]>([]);
  const [impactSummary, setImpactSummary]         = useState<any>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/mentoring/requests/${params.id}`);
      setRequest(res.data.data);
      if (res.data.data.sessions?.length > 0) {
        const sorted = [...res.data.data.sessions].sort(
          (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        );
        setActiveSession(sorted[0]);
      }
      
      // Fetch assessments
      if (res.data.data.umkm_id) {
        const asRes = await api.get(`/v1/assessments?umkm_id=${res.data.data.umkm_id}`);
        const all = (asRes.data.data || []).filter((a: any) => a.submitted_at).sort(
          (a: any, b: any) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
        );
        setAssessments(all);
      }

      // Fetch assessment categories
      const catRes = await api.get('/v1/mentoring/assessment-categories');
      setAssessmentCategories(catRes.data.data || []);

      // Fetch impact summary
      try {
        const impactRes = await api.get(`/v1/mentoring/requests/${params.id}/impact-summary`);
        setImpactSummary(impactRes.data.data);
      } catch (err) {
        console.error("Gagal mengambil riwayat impact:", err);
      }

    } catch (err) {
      console.error("Gagal mengambil detail mentoring:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSession(true);
    try {
      await api.post(`/v1/mentoring/requests/${params.id}/sessions`, sessionForm);
      setSessionDialogOpen(false);
      setSessionForm(DEFAULT_SESSION_FORM);
      setActionStatus({ type: "success", message: t("msg_sesi_berhasil_dijadwalkan") });
      fetchData();
    } catch (err: any) {
      setActionStatus({
        type: "destructive",
        message: err.response?.data?.message || "Gagal membuat sesi.",
      });
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      await api.post(`/v1/mentoring/sessions/${activeSession.id}/notes`, { 
        content: noteContent,
        improved_categories: improvedCategories.length > 0 ? improvedCategories : undefined,
        has_measurable_impact: improvedCategories.length > 0
      });
      setNoteContent("");
      setImprovedCategories([]);
      fetchData();
    } catch {
      setActionStatus({ type: "destructive", message: t("msg_gagal_menambahkan_catatan") });
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCompleteRequest = async () => {
    if (!confirm(t("confirm_selesaikan_permintaan_mentoring_ini"))) return;
    try {
      await api.post(`/v1/mentoring/requests/${params.id}/complete`);
      setActionStatus({ type: "success", message: t("msg_mentoring_ditandai_selesai") });
      fetchData();
    } catch {
      setActionStatus({ type: "destructive", message: t("msg_gagal_menyelesaikan_permintaan") });
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProject(true);
    try {
      await api.post("/v1/projects", {
        ...projectForm,
        consultation_request_id: params.id,
        umkm_id: request?.umkm?.id || request?.umkm_id,
        status: "active",
        started_at: projectForm.started_at || null,
        ended_at: projectForm.ended_at || null,
      });
      setProjectDialogOpen(false);
      setProjectForm({ name: '', type: 'advisory', started_at: '', ended_at: '' });
      setActionStatus({ type: "success", message: t("msg_proyek_berhasil_diinisiasi") });
      fetchData();
    } catch (err: any) {
      setActionStatus({ type: "destructive", message: err.response?.data?.message || "Gagal membuat proyek." });
    } finally {
      setSubmittingProject(false);
    }
  };

  // ── Loading / not found ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Memuat detail mentoring...
        </p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <AlertCircle size={36} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground font-medium">{t("data_tidak_ditemukan")}</p>
      </div>
    );
  }

  return (
    <DashboardPageShell
      title={t("title_sesi_mentoring")}
      subtitle={`Topik: ${request.topic}`}
      icon={GraduationCap}
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
        <StatusAlert status={actionStatus} onDismiss={() => setActionStatus(null)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Kolom Kiri (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Info Card */}
            <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {request.umkm?.name || "Mitra UMKM"}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Diminta oleh: {request.requested_by_user?.name || "—"}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge map={REQUEST_STATUS} value={request.status} />
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <InfoRow icon={Tag}      label={t("label_topik")}             value={request.topic || "—"} />
                <InfoRow icon={FileText} label={t("label_deskripsi_masalah")} value={
                  <span className="text-foreground/80 leading-relaxed">{request.description || "—"}</span>
                } />

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
                  <Button className="gap-2" onClick={() => setSessionDialogOpen(true)}>
                    <Calendar size={16} /> Jadwalkan Sesi Baru
                  </Button>
                  {request.status !== "done" && (
                    <Button
                      variant="outline"
                      className="gap-2 text-success border-success/30 hover:bg-success/5 hover:text-success"
                      onClick={handleCompleteRequest}
                    >
                      <CheckCircle2 size={16} /> Tandai Selesai
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>



            {/* Session History */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <MessageSquare size={16} className="text-primary" />
                Riwayat Sesi &amp; Catatan
              </h3>

              {!request.sessions?.length ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/5">
                  <Calendar size={32} className="text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Belum ada sesi yang dijadwalkan.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 mt-1"
                    onClick={() => setSessionDialogOpen(true)}
                  >
                    <Plus size={14} /> Jadwalkan Sesi
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.sessions.map((session: any) => (
                    <Card key={session.id} className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">

                      {/* Session header */}
                      <div className="p-4 bg-muted/10 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm">

                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-primary font-medium">
                            <Calendar size={13} />
                            {new Date(session.scheduled_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock size={13} />
                            {new Date(session.scheduled_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </div>

                          {/* Medium */}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {session.medium === "online"
                              ? <Video size={13} className="text-blue-500" />
                              : <Users size={13} className="text-primary" />}
                            <span className="capitalize text-xs font-medium">{session.medium}</span>
                          </div>

                          {/* Meeting link */}
                          {session.meeting_link && (
                            <a
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary font-bold flex items-center gap-1 hover:underline"
                            >
                              <Video size={11} /> Buka Link
                            </a>
                          )}

                          {/* Location */}
                          {session.location && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <MapPin size={11} /> {session.location}
                            </div>
                          )}
                        </div>

                        <StatusBadge map={SESSION_STATUS} value={session.status} />
                      </div>

                      {/* Notes */}
                      <CardContent className="p-4 space-y-3">
                        {session.notes?.length > 0 ? (
                          <div className="space-y-3">
                            {session.notes.map((note: any) => (
                              <div key={note.id} className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User size={12} className="text-primary" />
                                    </div>
                                    <span className="text-xs font-semibold">{note.author?.name}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(note.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground/80 leading-relaxed">{note.content}</p>
                                {note.improved_categories?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {note.improved_categories.map((catId: number) => {
                                      const cat = assessmentCategories.find(c => c.id === catId);
                                      return cat ? (
                                        <Badge key={catId} variant="outline" className="text-[9px] bg-success/10 text-success border-success/20">
                                          📈 Kategori: {cat.name}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">{t("belum_ada_catatan_untuk_sesi_ini")}</p>
                        )}

                        {session.status !== "cancelled" && (
                          <form onSubmit={handleAddNote} className="space-y-4 pt-3 border-t border-border/50">
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-foreground">{t("tambah_catatan_baru")}</Label>
                              <Textarea
                                placeholder={t("placeholder_tuliskan_catatan_perkembangan_hasil_disk")}
                                className="min-h-[100px] text-sm resize-y"
                                required
                                value={activeSession?.id === session.id ? noteContent : ""}
                                onChange={(e) => {
                                  setActiveSession(session);
                                  setNoteContent(e.target.value);
                                }}
                              />
                            </div>
                            
                            {/* Assessment Category Selection */}
                            {activeSession?.id === session.id && (
                              <div className="p-3 bg-muted/10 border border-border/50 rounded-xl space-y-3">
                                <div>
                                  <Label className="text-xs font-semibold flex items-center gap-2">
                                    <TrendingUp size={14} className="text-primary" />
                                    Peningkatan Skor Assessment (Opsional)
                                  </Label>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Centang kategori jika ada perbaikan nyata pada UMKM setelah sesi ini. Skor UMKM akan otomatis meningkat.
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {assessmentCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`cat-${cat.id}`} 
                                        checked={improvedCategories.includes(cat.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) setImprovedCategories([...improvedCategories, cat.id]);
                                          else setImprovedCategories(improvedCategories.filter(id => id !== cat.id));
                                        }}
                                      />
                                      <label 
                                        htmlFor={`cat-${cat.id}`} 
                                        className="text-xs font-medium leading-none cursor-pointer text-muted-foreground"
                                      >
                                        {cat.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={submittingNote || !noteContent.trim() || activeSession?.id !== session.id}
                                className="gap-2 h-9"
                              >
                                {submittingNote && activeSession?.id === session.id
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Send size={14} />}
                                Kirim Catatan
                              </Button>
                            </div>
                          </form>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Kolom Kanan (1/3) ── */}
          <div className="space-y-4">

            {/* UMKM Context */}
            <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
              <div className="bg-primary p-5">
                <p className="text-[10px] font-black tracking-widest text-white/60 mb-1">
                  Konteks UMKM
                </p>
                <h3 className="text-base font-black text-white leading-tight">
                  {request.umkm?.name || "—"}
                </h3>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Sektor",   value: request.umkm?.sector || "—" },
                    { label: "Karyawan", value: request.umkm?.employee_count ? `${request.umkm.employee_count} Orang` : "—" },
                    { label: "Pemilik",  value: request.umkm?.owner_name || "—" },
                    { label: "Berdiri",  value: request.umkm?.established_year || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-muted/20 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wide">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 font-bold"
                  onClick={() =>
                    request.umkm?.slug
                      ? router.push(`/umkm/${request.umkm.slug}`)
                      : setActionStatus({ type: "destructive", message: t("msg_profil_umkm_tidak_tersedia") })
                  }
                >
                  <User size={15} /> Lihat Profil Lengkap
                </Button>
              </CardContent>
            </Card>

            {/* Quick links / Projects */}
            <Card className="border-border/50 shadow-sm rounded-xl bg-card">
              <CardHeader className="pb-2 px-5 pt-5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">{t("proyek_aktif")}</CardTitle>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => setProjectDialogOpen(true)}>
                  <Plus size={14} className="text-primary" />
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {request.projects?.length > 0 ? (
                  <div className="space-y-3">
                    {request.projects.map((project: any) => (
                      <div key={project.id} className="p-3 rounded-xl border border-border/50 bg-muted/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-primary truncate max-w-[150px]">{project.name}</p>
                          <Badge variant="outline" className="text-[9px] bg-background">
                            {project.status === 'active' ? 'Aktif' : 'Selesai'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Target: {project.ended_at ? format(new Date(project.ended_at), 'dd MMM yyyy') : '—'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-2">{t("belum_ada_proyek")}</p>
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setProjectDialogOpen(true)}>
                      <Briefcase size={13} className="mr-2" /> Inisiasi Proyek
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Assessment Score Progression (Full Width) ── */}
        {assessments.length >= 2 && (
          <div className="space-y-6 pt-8 mt-8 border-t border-border/50">
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight flex items-center gap-2">
                <TrendingUp size={20} /> Progres Skor Kematangan
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("perbandingan_hasil_assessment_sebelum_da")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assessments.slice(-2).map((a: any, i: number) => (
                <div key={a.id} className={`p-5 rounded-2xl border ${i === 1 ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-card'}`}>
                  <p className="text-[11px] font-bold text-muted-foreground mb-2 tracking-wider">{i === 0 ? 'Sebelum Pendampingan' : 'Setelah Pendampingan'}</p>
                  <p className="text-3xl font-black text-primary">{a.total_score ?? '—'}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-1">{a.level || '—'}</p>
                </div>
              ))}
              {(() => {
                const prev = assessments[assessments.length - 2];
                const curr = assessments[assessments.length - 1];
                const delta = (curr.total_score || 0) - (prev.total_score || 0);
                return (
                  <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center ${delta > 0 ? 'border-success/30 bg-success/5' : delta < 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 bg-card'}`}>
                    <p className="text-[11px] font-bold text-muted-foreground mb-2 tracking-wider">{t("perubahan_skor")}</p>
                    <p className={`text-4xl font-black ${delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                    </p>
                    <p className="text-sm font-medium mt-1">{delta > 0 ? '📈 Naik' : delta < 0 ? '📉 Turun' : '— Tetap'}</p>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-4">
              <div className="lg:col-span-2">
                {radarData.length > 0 && (
                  <div className="h-[450px] w-full bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickCount={6} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Radar name="Sebelum Pendampingan" dataKey="Sebelum" stroke="#9ca3af" strokeWidth={2} fill="#9ca3af" fillOpacity={0.2} />
                        <Radar name="Setelah Pendampingan" dataKey="Sesudah" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-1">
                {/* Impact Summary / Riwayat Peningkatan */}
                {impactSummary?.improved_categories?.length > 0 ? (
                  <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" /> Riwayat Kategori Diperbaiki
                    </h4>
                    <p className="text-xs text-muted-foreground">{t("kategori_yang_mendapatkan_skor_tambahan")}</p>
                    <div className="space-y-3">
                      {impactSummary.improved_categories.map((cat: any) => (
                        <div key={cat.id} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-semibold">{cat.name}</span>
                          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                            + Ditandai {cat.mention_count}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm text-center">
                    <p className="text-xs text-muted-foreground italic">{t("belum_ada_riwayat_perbaikan_kategori_yan")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog Jadwal Sesi ── */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Calendar size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Jadwalkan Sesi Mentoring
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Tentukan waktu dan media konsultasi dengan mitra UMKM.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSession}>
            <div className="p-6 space-y-4">
              {/* Waktu */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Waktu Pelaksanaan <span className="text-destructive">*</span>
                </Label>
                <DateTimePicker
                  includeTime
                  value={sessionForm.scheduled_at ? new Date(sessionForm.scheduled_at) : null}
                  onChange={(d) => setSessionForm({ ...sessionForm, scheduled_at: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" })}
                  className="h-10 text-sm"
                />
              </div>

              {/* Durasi + Media */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{t("durasi_menit")}</Label>
                  <Input
                    type="number"
                    required
                    min={15}
                    value={sessionForm.duration_minutes}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{t("media")}</Label>
                  <Select
                    value={sessionForm.medium}
                    onValueChange={(v) => setSessionForm({ ...sessionForm, medium: v })}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">{t("online_video_call")}</SelectItem>
                      <SelectItem value="offline">{t("offline_tatap_muka")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Link / Lokasi */}
              {sessionForm.medium === "online" ? (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{t("link_meeting")}</Label>
                  <Input
                    placeholder="https://zoom.us/j/..."
                    value={sessionForm.meeting_link}
                    onChange={(e) => setSessionForm({ ...sessionForm, meeting_link: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{t("lokasi_pertemuan")}</Label>
                  <Input
                    placeholder={t("placeholder_ruang_rapat_lantai_2")}
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="p-6 pt-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10"
                onClick={() => setSessionDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingSession}
                className="flex-1 h-10 gap-2 font-semibold"
              >
                {submittingSession
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Calendar size={15} />}
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Inisiasi Proyek ── */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Briefcase size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{t("inisiasi_proyek_pendampingan")}</DialogTitle>
                <DialogDescription className="text-xs">
                  Buat proyek terkait permintaan pendampingan ini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateProject}>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Nama Proyek <span className="text-destructive">*</span></Label>
                <Input required value={projectForm.name} onChange={(e) => setProjectForm({...projectForm, name: e.target.value})} className="h-10 text-sm" placeholder={t("placeholder_contoh_digitalisasi_pembukuan")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">{t("tipe_proyek")}</Label>
                <Select value={projectForm.type} onValueChange={(v) => setProjectForm({...projectForm, type: v})}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advisory">{t("advisory_konsultasi")}</SelectItem>
                    <SelectItem value="training">{t("training_pelatihan")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="started_at" className="text-xs font-semibold text-muted-foreground">{t("tanggal_mulai")}</Label>
                  <DateTimePicker value={projectForm.started_at ? new Date(projectForm.started_at) : null} onChange={(d) => setProjectForm({...projectForm, started_at: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ended_at" className="text-xs font-semibold text-muted-foreground">{t("target_selesai")}</Label>
                  <DateTimePicker value={projectForm.ended_at ? new Date(projectForm.ended_at) : null} onChange={(d) => setProjectForm({...projectForm, ended_at: d ? format(d, 'yyyy-MM-dd') : ""})} className="h-10 text-sm" />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 gap-2">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={() => setProjectDialogOpen(false)}>{t("batal")}</Button>
              <Button type="submit" disabled={submittingProject} className="flex-1 h-10 gap-2 font-semibold">
                {submittingProject ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Buat Proyek
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}