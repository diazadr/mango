"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { AdminDataCard } from "@/src/components/ui/dashboard/AdminDataView";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  History,
  Briefcase,
  TrendingUp,
  Lock,
  CircleDot,
} from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useTranslations } from "next-intl";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export function MentoringDetailView() {
  const t = useTranslations("MentoringDetailView");
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);

  const radarData = React.useMemo(() => {
    if (assessments.length < 2) return [];
    const prev = assessments[assessments.length - 2];
    const curr = assessments[assessments.length - 1];
    if (!prev.chart_data || !curr.chart_data) return [];
    return prev.chart_data.map((prevItem: any) => {
      const currItem =
        curr.chart_data.find((c: any) => c.subject === prevItem.subject) || { score: 0 };
      return {
        subject: prevItem.subject,
        Sebelum: prevItem.score,
        Sesudah: currItem.score,
        fullMark: 5,
      };
    });
  }, [assessments]);

  const fetchData = () => {
    api
      .get(`/v1/mentoring/requests/${params.id}`)
      .then((res) => setRequest(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    api
      .get("/v1/assessments")
      .then((res) => {
        const all = (res.data.data || [])
          .filter((a: any) => a.submitted_at)
          .sort(
            (a: any, b: any) =>
              new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
          );
        setAssessments(all);
      })
      .catch(() => {});
  }, [params.id]);

  const hasAdvisor = request?.assignments?.length > 0;

  if (loading) {
    return (
      <DashboardPageShell
        title={t("title_detail_proses_pendampingan")}
        subtitle={t("title_tracing_status_dan_progres_penyelesaian")}
      >
        <LoadingState message={t("message_memuat_data_pendampingan")} />
      </DashboardPageShell>
    );
  }

  if (!request) return null;

  // Map status ke value yang dikenali StatusBadge
  const statusMap: Record<string, string> = {
    pending: "pending",
    assigned: "assigned",
    ongoing: "ongoing",
    done: "done",
  };

  const steps = [
    {
      id: "pending",
      label: "Pengajuan",
      desc: "Permohonan dikirim oleh UMKM",
      date: request.created_at,
      isDone: true,
    },
    {
      id: "assigned_dept",
      label: "Delegasi Unit",
      desc: request.department
        ? `Diterima oleh ${request.department.name}`
        : "Menunggu pemilihan departemen",
      date: request.updated_at,
      isDone: !!request.department,
    },
    {
      id: "assigned_mentor",
      label: "Penunjukan Advisor",
      desc: request.assignments?.[0]
        ? `Ditangani oleh ${request.assignments[0].mentor?.name}`
        : "Menunggu penunjukan ahli",
      date: request.assignments?.[0]?.created_at,
      isDone: request.assignments?.length > 0,
    },
    {
      id: "ongoing",
      label: "Konsultasi Aktif",
      desc:
        request.sessions?.length > 0
          ? `${request.sessions.length} Sesi Terjadwal`
          : "Menunggu jadwal pertemuan",
      date: request.sessions?.[0]?.created_at,
      isDone: request.status === "ongoing" || request.status === "done",
    },
    {
      id: "done",
      label: "Selesai",
      desc: "Masalah terselesaikan / Sesi berakhir",
      date: request.status === "done" ? request.updated_at : null,
      isDone: request.status === "done",
    },
  ];

  return (
    <DashboardPageShell
      title={t("title_detail_proses_pendampingan_1")}
      subtitle={t("title_tracing_status_dan_progres_penyelesaian_1")}
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Kolom Kiri: Alur Progres ── */}
          <div className="lg:col-span-1 space-y-6">
            <AdminDataCard>
              <div className="p-6 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Alur Progres
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-8 relative">
                  {/* vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {steps.map((step) => (
                    <div key={step.id} className="relative pl-9">
                      <div
                        className={`absolute left-0 top-0.5 h-[22px] w-[22px] rounded-full border-2 border-background shadow-sm flex items-center justify-center transition-colors ${
                          step.isDone
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.isDone ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <CircleDot className="h-3 w-3" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-semibold ${
                            step.isDone ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {step.desc}
                        </p>
                        {step.date && (
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {format(new Date(step.date), "dd MMM yyyy, HH:mm", {
                              locale: localeId,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AdminDataCard>
          </div>

          {/* ── Kolom Kanan: Detail Informasi ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Utama */}
            <AdminDataCard>
              <div className="p-6 border-b border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{t("topik_permasalahan")}</p>
                    <h2 className="text-xl font-bold text-foreground">{request.topic}</h2>
                  </div>
                  <StatusBadge type="status" value={statusMap[request.status] ?? request.status} />
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Deskripsi */}
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("deskripsi_kendala")}</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {request.description}
                  </p>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Advisor */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{t("advisor_penanggung_jawab")}</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {request.assignments?.[0]?.mentor?.name || "Menunggu Delegasi"}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("dosen_staf_ahli")}</p>
                      </div>
                    </div>
                  </div>

                  {/* UMKM */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{t("umkm_pengaju")}</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {request.umkm?.name || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Jadwal Sesi */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{t("jadwal_sesi")}</p>
                    {request.sessions?.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t("sesi_terdekat")}</p>
                          <p className="text-xs text-success font-medium">
                            {format(
                              new Date(request.sessions[0].scheduled_at),
                              "dd MMMM yyyy",
                              { locale: localeId }
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 opacity-50">
                        <div className="h-9 w-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-muted-foreground italic">{t("belum_ada_jadwal")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AdminDataCard>

            {/* Log Konsultasi */}
            {request.sessions?.length > 0 && (
              <AdminDataCard>
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Log Konsultasi & Catatan
                  </h3>
                </div>
                <div className="divide-y divide-border/50">
                  {request.sessions.map((session: any) => (
                    <div key={session.id} className="p-6 space-y-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {format(new Date(session.scheduled_at), "eeee, dd MMM yyyy", {
                              locale: localeId,
                            })}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {session.medium}
                          </Badge>
                        </div>
                        <StatusBadge
                          type="status"
                          value={session.status === "completed" ? "active" : "inactive"}
                        />
                      </div>

                      {session.notes?.length > 0 ? (
                        <div className="ml-6 space-y-2">
                          {session.notes.map((note: any) => (
                            <div
                              key={note.id}
                              className="bg-background rounded-lg p-4 border border-border/50"
                            >
                              <p className="text-sm text-foreground leading-relaxed">
                                "{note.content}"
                              </p>
                              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                                <UserCheck className="h-3 w-3" />
                                {note.author?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="ml-6 text-xs text-muted-foreground italic">
                          Belum ada catatan untuk sesi ini.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </AdminDataCard>
            )}

            {/* Proyek Pendampingan */}
            <AdminDataCard>
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Proyek Pendampingan
                </h3>
                {!hasAdvisor && (
                  <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                    <Lock className="h-2.5 w-2.5" /> Menunggu advisor
                  </Badge>
                )}
              </div>
              <div className="p-6">
                {!hasAdvisor ? (
                  <EmptyState
                    icon={Lock}
                    title={t("title_menunggu_advisor")}
                    description={t("description_proyek_baru_hanya_bisa_dibuat_setelah_ad")}
                  />
                ) : request.projects?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {request.projects.map((project: any) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={() =>
                          router.push(`/workspace/umkm/projects/${project.id}`)
                        }
                      >
                        <div className="flex items-center justify-between mb-3">
                          <StatusBadge
                            type="status"
                            value={
                              project.status === "active"
                                ? "active"
                                : project.status === "completed"
                                ? "done"
                                : "inactive"
                            }
                          />
                          <Badge variant="outline" className="text-[10px]">
                            {project.type}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {project.started_at} — {project.ended_at || "Belum ditentukan"}
                        </div>
                        <div className="mt-3 pt-3 border-t border-dashed border-border/40 flex items-center justify-between text-xs text-primary font-semibold">
                          Lihat Detail <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title={t("title_belum_ada_proyek")}
                    description={t("description_belum_ada_proyek_untuk_pendampingan_ini")}
                  />
                )}
              </div>
            </AdminDataCard>

            {/* Progres Skor Kematangan */}
            {assessments.length >= 2 && (
              <AdminDataCard>
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Progres Skor Kematangan
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perbandingan skor assessment terakhir vs sebelumnya setelah pendampingan
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {assessments.slice(-2).map((a: any, i: number) => (
                      <div
                        key={a.id}
                        className={`p-4 rounded-lg border ${
                          i === 1
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/50 bg-muted/20"
                        }`}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {i === 0 ? "Sebelum Pendampingan" : "Setelah Pendampingan"}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {a.total_score ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{a.level || "—"}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {format(new Date(a.submitted_at), "dd MMM yyyy", { locale: localeId })}
                        </p>
                      </div>
                    ))}

                    {(() => {
                      const prev = assessments[assessments.length - 2];
                      const curr = assessments[assessments.length - 1];
                      const delta = (curr.total_score || 0) - (prev.total_score || 0);
                      return (
                        <div
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center ${
                            delta > 0
                              ? "border-success/30 bg-success/5"
                              : delta < 0
                              ? "border-destructive/30 bg-destructive/5"
                              : "border-border/50 bg-muted/20"
                          }`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Perubahan Skor
                          </p>
                          <p
                            className={`text-3xl font-bold ${
                              delta > 0
                                ? "text-success"
                                : delta < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {delta > 0 ? "📈 Naik" : delta < 0 ? "📉 Turun" : "— Tetap"}
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Radar Chart */}
                  {radarData.length > 0 && (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid hsl(var(--border))",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "16px" }} />
                          <Radar
                            name="Sebelum Pendampingan"
                            dataKey="Sebelum"
                            stroke="hsl(var(--muted-foreground))"
                            fill="hsl(var(--muted-foreground))"
                            fillOpacity={0.2}
                          />
                          <Radar
                            name="Setelah Pendampingan"
                            dataKey="Sesudah"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      const latest = assessments[assessments.length - 1];
                      if (latest)
                        router.push(`/workspace/umkm/assessment/${latest.id}/result`);
                    }}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Lihat Detail Perbandingan Assessment
                  </Button>
                </div>
              </AdminDataCard>
            )}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}