"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  Trophy, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight, 
  Loader2, 
  AlertTriangle,
  MessageSquarePlus,
  ArrowLeft,
  Download,
  ListTodo,
  GitCompare,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Info,
  UserCheck,
  FolderKanban,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { motion } from "framer-motion";
import { useRouter } from "@/src/i18n/navigation";
import MaturityChart from "../components/MaturityChart";
import { useTranslations } from "next-intl";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Legend, Tooltip
} from "recharts";

const ANSWERS_PER_PAGE = 10;

export function AssessmentResultView() {
  const t = useTranslations("AssessmentResultView");
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [prevData, setPrevData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerPage, setAnswerPage] = useState(0);

  useEffect(() => {
    api.get(`/v1/assessments/${params.id}`)
      .then(async (res) => {
        const current = res.data.data;
        setData(current);
        // Fetch all assessments and find the previous one
        try {
          const allRes = await api.get("/v1/assessments");
          const all: any[] = allRes.data.data || [];
          const submitted = all
            .filter((a: any) => a.submitted_at && String(a.id) !== String(params.id))
            .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
          if (submitted.length > 0) {
            const prevRes = await api.get(`/v1/assessments/${submitted[0].id}`);
            setPrevData(prevRes.data.data);
          }
        } catch { /* ignore — overlay is optional */ }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/v1/assessments/${data.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Assessment_${data.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      console.error("Failed to download PDF", e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Flatten all answers for pagination
  const allAnswers: any[] = data?.answers || [];
  const totalPages = Math.ceil(allAnswers.length / ANSWERS_PER_PAGE);
  const pagedAnswers = allAnswers.slice(answerPage * ANSWERS_PER_PAGE, (answerPage + 1) * ANSWERS_PER_PAGE);

  // Group paged answers by category
  const groupedAnswers = pagedAnswers.reduce((acc: any, ans: any) => {
    const cat = ans.question?.category?.name || "Lainnya";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ans);
    return acc;
  }, {});

  return (
    <DashboardPageShell
      title={t("title_hasil_analisis_kematangan")}
      subtitle={t("title_berdasarkan_jawaban_anda_berikut_adalah")}
    >
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/workspace/umkm/assessment')}
          className="rounded-xl gap-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={18} />
          Kembali ke Assessment
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? "Mengunduh..." : "Unduh Hasil (PDF)"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Score Card */}
        <Card className="lg:col-span-1 border-primary/20 shadow-xl rounded-3xl bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={120} />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/80 tracking-wide text-xs font-bold">{t("skor_keseluruhan")}</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="Info Level">
                    <Info size={14} className="text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
                  <DialogHeader className="bg-primary/5 p-6 border-b border-border/50">
                    <DialogTitle className="text-lg font-bold text-primary flex items-center gap-2">
                      <Trophy size={18} /> Keterangan Tingkat Kematangan (Level 1–5)
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                    {[
                      { level: 1, name: "Awal", range: "1.0 – 1.8", desc: "Bisnis masih berjalan secara tradisional dan reaktif. Tidak ada dokumentasi, proses tidak terstandar, dan pengelolaan masih sangat terbatas.", color: "border-red-400 bg-red-50 dark:bg-red-950/20" },
                      { level: 2, name: "Berkembang", range: "1.9 – 2.6", desc: "Ada upaya awal untuk mendokumentasikan proses. Beberapa aktivitas mulai terstruktur namun belum konsisten. Digitalisasi masih minimal.", color: "border-orange-400 bg-orange-50 dark:bg-orange-950/20" },
                      { level: 3, name: "Terkelola", range: "2.7 – 3.4", desc: "Proses bisnis sudah terdefinisi dan diikuti secara konsisten. Ada pengukuran dasar dan mulai menggunakan teknologi untuk operasional sehari-hari.", color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20" },
                      { level: 4, name: "Teroptimasi", range: "3.5 – 4.2", desc: "Operasional berbasis data. Pengambilan keputusan menggunakan analitik. Sistem digital terintegrasi dan ada perbaikan berkelanjutan.", color: "border-blue-400 bg-blue-50 dark:bg-blue-950/20" },
                      { level: 5, name: "Inovatif", range: "4.3 – 5.0", desc: "Transformasi digital penuh. Otomatisasi, AI, dan inovasi berkelanjutan menjadi bagian dari DNA bisnis. Kompetitif di skala nasional dan internasional.", color: "border-green-400 bg-green-50 dark:bg-green-950/20" },
                    ].map((l) => (
                      <div key={l.level} className={`p-4 rounded-xl border-l-4 ${l.color}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-primary">Level {l.level}</span>
                          <span className="text-sm font-bold text-foreground">{l.name}</span>
                          <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{l.range}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{l.desc}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="text-7xl font-black">{data.total_score}</div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{data.level}</div>
              <p className="text-white/70 text-sm italic">{t("maturity_level_berdasarkan_standar_mango")}</p>
            </div>
            <Badge className="bg-white/20 text-white border-transparent py-1 px-3">
              Terverifikasi Otomatis
            </Badge>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="lg:col-span-2 border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="text-accent" />
              Visualisasi Dimensi Kematangan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.chart_data && (
              <div className="flex flex-col gap-6">
                {/* Radar Chart */}
                <div className="flex justify-center">
                  <MaturityChart data={data.chart_data} size={300} showLegend={true} />
                </div>

                {/* Horizontal Bar Breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-3">Rincian Per Dimensi</p>
                  {data.chart_data.map((d: any) => {
                    const pct = d.fullMark > 0 ? Math.round((d.score / d.fullMark) * 100) : 0;
                    const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
                    const bgColor = pct >= 70
                      ? "bg-green-500/10 dark:bg-green-500/15"
                      : pct >= 40
                      ? "bg-amber-500/10 dark:bg-amber-500/15"
                      : "bg-red-500/10 dark:bg-red-500/15";
                    return (
                      <div key={d.subject} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${bgColor} border border-border/40`}>
                        <span className="text-xs font-semibold text-foreground w-36 shrink-0 truncate">{d.subject}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <span className="text-xs font-black shrink-0" style={{ color }}>
                          {typeof d.score === 'number' ? d.score.toFixed(1) : d.score}
                          <span className="font-normal text-muted-foreground">/5</span>
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Radar Overlay Card — baseline vs current */}
        {prevData?.chart_data && (
          <Card className="lg:col-span-3 border-border/50 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-primary flex items-center gap-2">
                <GitCompare className="text-accent" />
                Perbandingan Dimensi: Assessment Sebelumnya vs Sekarang
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart
                    data={data.chart_data?.map((d: any) => ({
                      subject: d.subject,
                      Sekarang: d.score,
                      Sebelumnya: prevData.chart_data?.find((p: any) => p.subject === d.subject)?.score ?? 0,
                    }))}
                  >
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Radar name="Sebelumnya" dataKey="Sebelumnya" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 3" />
                    <Radar name="Sekarang" dataKey="Sekarang" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2.5} />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      formatter={(val: any, name: any) => [`Skor ${val}/5`, name]}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Delta table */}
                <div className="space-y-2">
                  <p className="text-xs font-black tracking-wide text-muted-foreground mb-4">{t("perubahan_per_dimensi")}</p>
                  {data.chart_data?.map((d: any) => {
                    const prev = prevData.chart_data?.find((p: any) => p.subject === d.subject)?.score ?? d.score;
                    const delta = d.score - prev;
                    return (
                      <div key={d.subject} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-xs font-bold text-foreground truncate max-w-[180px]">{d.subject}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono text-muted-foreground">{prev} → {d.score}</span>
                          <Badge
                            className={`text-[10px] font-black px-2 py-0.5 flex items-center gap-0.5 ${
                              delta > 0 ? "bg-success/10 text-success border-success/20" :
                              delta < 0 ? "bg-destructive/10 text-destructive border-destructive/20" :
                              "bg-muted/50 text-muted-foreground border-border"
                            }`}
                          >
                            {delta > 0 ? <ArrowUp size={10} /> : delta < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
                            {delta > 0 ? `+${delta.toFixed(1)}` : delta === 0 ? "=" : delta.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                    <span className="text-xs font-black text-primary">{t("total_skor")}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{prevData.total_score} → {data.total_score}</span>
                      <Badge className={`text-[10px] font-black px-2 py-0.5 flex items-center gap-0.5 ${
                        data.total_score > prevData.total_score ? "bg-success/10 text-success border-success/20" :
                        data.total_score < prevData.total_score ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-muted/50 text-muted-foreground border-border"
                      }`}>
                        {data.total_score > prevData.total_score ? <ArrowUp size={10} /> : data.total_score < prevData.total_score ? <ArrowDown size={10} /> : <Minus size={10} />}
                        {data.total_score > prevData.total_score ? `+${(data.total_score - prevData.total_score).toFixed(2)}` : data.total_score === prevData.total_score ? "=" : (data.total_score - prevData.total_score).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advisor & Project Info */}
        {(data.advisor_name || data.project_name || prevData) && (
          <Card className="lg:col-span-3 border-border/50 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="border-b border-border/50 bg-white/50 dark:bg-black/20">
              <CardTitle className="text-primary flex items-center gap-2">
                <UserCheck className="text-accent" />
                Informasi Pendampingan & Proyek
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-muted/20 border border-border/50">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">MENTOR / ADVISOR</p>
                    <p className="text-sm font-semibold text-foreground">
                      {data.advisor_name || "Belum ada mentor yang ditugaskan"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-muted/20 border border-border/50">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground tracking-wider mb-1">PROYEK TERKAIT</p>
                    <p className="text-sm font-semibold text-foreground">
                      {data.project_name || "Tidak ada proyek yang tercatat mendasari asesmen ini"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Card */}
        <Card className="lg:col-span-3 border-border/50 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="text-accent" />
              Rekomendasi Intervensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recommendations?.length > 0 ? data.recommendations.map((rec: any) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className={`p-2 rounded-full shrink-0 ${
                  rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-primary">
                      {rec.category?.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Gap: {rec.gap_score}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {rec.recommendation_text}
                  </p>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-muted-foreground italic text-center py-6">{t("tidak_ada_rekomendasi_spesifik_skor_suda")}</p>
            )}
          </CardContent>
        </Card>

        {/* Answers Overview — with pagination */}
        <Card className="lg:col-span-3 border-border/50 shadow-xl rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <ListTodo className="text-accent" />
              Rincian Jawaban
            </CardTitle>
            {allAnswers.length > 0 && (
              <span className="text-xs font-bold text-muted-foreground">
                {answerPage * ANSWERS_PER_PAGE + 1}–{Math.min((answerPage + 1) * ANSWERS_PER_PAGE, allAnswers.length)} dari {allAnswers.length} jawaban
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {allAnswers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                Rincian jawaban tidak tersedia untuk assessment ini.
              </p>
            ) : (
              <>
                {Object.entries(groupedAnswers).map(([category, answers]: [string, any]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="text-xs font-black text-primary/60 tracking-wide px-1">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {answers.map((ans: any) => (
                        <div key={ans.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                          <p className="text-xs font-bold text-foreground leading-snug">{ans.question?.question_text}</p>
                          <div className="flex items-center justify-between text-[11px] font-medium text-primary bg-primary/5 p-2 rounded-lg border border-primary/10">
                            <span>{ans.answer_text}</span>
                            <Badge variant="outline" className="text-[9px] font-black h-4 px-1 shrink-0">
                              Skor: {ans.score}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswerPage(p => Math.max(0, p - 1))}
                      disabled={answerPage === 0}
                      className="rounded-xl gap-1"
                    >
                      <ChevronLeft size={14} /> Sebelumnya
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswerPage(i)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            i === answerPage 
                              ? 'bg-primary text-white' 
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswerPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={answerPage === totalPages - 1}
                      className="rounded-xl gap-1"
                    >
                      Berikutnya <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="lg:col-span-3 border-border/50 shadow-sm rounded-3xl bg-accent/5 border-dashed border-accent/30">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
                <MessageSquarePlus />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{t("butuh_pendampingan_lebih_lanjut")}</h3>
                <p className="text-muted-foreground">{t("ajukan_permohonan_konsultasi_dengan_advi")}</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/workspace/umkm/mentoring')}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 rounded-2xl gap-2 shadow-xl shadow-primary/20"
            >
              Ajukan Mentoring Sekarang
              <ArrowRight size={20} />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
