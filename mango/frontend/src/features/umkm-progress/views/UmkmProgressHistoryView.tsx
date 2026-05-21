"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  History,
  BarChart3,
  MessageSquare,
  Trophy,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Loader2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { progressService } from "../services/progressService";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import MaturityTrendChart from "@/src/features/umkm-assessment/components/MaturityTrendChart";

/* ─── Types ─── */
interface ScoreEntry { id: number; avg: number; }
interface HistoryItem {
  type: "assessment" | "mentoring";
  date: string;
  level?: string;
  total_score?: number;
  is_mentoring?: boolean;
  scores?: Record<string, ScoreEntry>;
  chart_data?: any[];
  topic?: string;
  desc?: string;
  advisor_name?: string;
  advisor_photo?: string;
  project_title?: string;
  triggered_by_project?: boolean;
}
interface ProgressData {
  umkm_name: string;
  history: HistoryItem[];
}

/* ─── Compact Radar Chart (pure SVG, theme-aware) ─── */
function CompactRadar({ scores, isDark }: { scores: Record<string, ScoreEntry>; isDark: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.65;
  const n = entries.length;
  const angleStep = (Math.PI * 2) / n;

  const getXY = (i: number, val: number) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / 5) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelXY = (i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    return { x: cx + (radius + 22) * Math.cos(angle), y: cy + (radius + 22) * Math.sin(angle) };
  };

  const rings = [1, 2, 3, 4, 5];
  const dataPts = entries.map(([, s], i) => getXY(i, s.avg));
  const polygon = dataPts.map(p => `${p.x},${p.y}`).join(" ");

  const getColor = (avg: number) =>
    avg / 5 >= 0.7 ? "#22c55e" : avg / 5 >= 0.4 ? "#f59e0b" : "#ef4444";

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const axisColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} overflow="visible">
        {/* Rings */}
        {rings.map((lvl) => {
          const pts = entries.map((_, i) => {
            const { x, y } = getXY(i, lvl);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke={gridColor}
              strokeWidth={lvl === 5 ? 1.5 : 1}
              strokeDasharray={lvl < 5 ? "3 3" : "0"}
            />
          );
        })}

        {/* Axes */}
        {entries.map((_, i) => {
          const outer = getXY(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={axisColor} strokeWidth={1} />;
        })}

        {/* Data area */}
        <polygon
          points={polygon}
          fill={isDark ? "rgba(30,58,95,0.4)" : "rgba(30,58,95,0.15)"}
          stroke="rgba(30,58,95,0.6)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Dots */}
        {dataPts.map((p, i) => {
          const [slug, s] = entries[i];
          const color = getColor(s.avg);
          const isHov = hovered === slug;
          return (
            <g key={i}>
              {isHov && <circle cx={p.x} cy={p.y} r={10} fill={color} fillOpacity={0.2} />}
              <circle
                cx={p.x} cy={p.y} r={isHov ? 5 : 3.5}
                fill={color} stroke={isDark ? "#0f172a" : "#fff"} strokeWidth={1.5}
                style={{ cursor: "pointer", transition: "r 0.15s" }}
                onMouseEnter={() => setHovered(slug)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}

        {/* Labels */}
        {entries.map(([slug, s], i) => {
          const { x, y } = getLabelXY(i);
          const color = getColor(s.avg);
          const isHov = hovered === slug;
          let anchor: "start" | "middle" | "end" = "middle";
          if (x < cx - 10) anchor = "end";
          else if (x > cx + 10) anchor = "start";
          const label = slug.charAt(0).toUpperCase() + slug.slice(1);

          return (
            <g key={slug}
              onMouseEnter={() => setHovered(slug)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <text
                x={x} y={y}
                fontSize="8"
                fontWeight={isHov ? "800" : "600"}
                textAnchor={anchor}
                fill={isHov ? color : (isDark ? "#64748b" : "#94a3b8")}
                style={{ transition: "fill 0.15s" }}
              >
                {label}
              </text>
              <text
                x={x} y={y + 11}
                fontSize="9"
                fontWeight="800"
                textAnchor={anchor}
                fill={isHov ? color : (isDark ? "#e2e8f0" : "#1e293b")}
              >
                {s.avg.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hovered tooltip */}
      {hovered && scores[hovered] && (
        <div
          className="mt-1 text-[10px] font-bold px-3 py-1.5 rounded-xl border"
          style={{
            background: isDark ? "#1e293b" : "#f8fafc",
            borderColor: isDark ? "#334155" : "#e2e8f0",
            color: getColor(scores[hovered].avg),
          }}
        >
          {hovered.charAt(0).toUpperCase() + hovered.slice(1)}: {scores[hovered].avg.toFixed(2)}/5
        </div>
      )}
    </div>
  );
}

/* ─── Per-dim bar list for sidebar ─── */
function DimBarList({ scores, isDark }: { scores: Record<string, ScoreEntry>; isDark: boolean }) {
  return (
    <div className="space-y-2 w-full">
      {Object.entries(scores).map(([slug, s]) => {
        const pct = Math.round((s.avg / 5) * 100);
        const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
        const label = slug.charAt(0).toUpperCase() + slug.slice(1);
        return (
          <div key={slug} className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold shrink-0"
              style={{ width: 72, color: isDark ? "#94a3b8" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {label}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: color, transition: "width 0.6s" }}
              />
            </div>
            <span className="text-[10px] font-black shrink-0" style={{ color, width: 22, textAlign: "right" }}>
              {s.avg.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main View ─── */
export function UmkmProgressHistoryView({ umkmUuid }: { umkmUuid?: string }) {
  const t = useTranslations("UmkmProgressHistory");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [data, setData] = React.useState<ProgressData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [chartView, setChartView] = React.useState<"radar" | "bars">("radar");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = umkmUuid
          ? await progressService.getProgressHistory(umkmUuid)
          : await progressService.getMyProgressHistory();
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch progress history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [umkmUuid]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <History className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold">{t("belum_ada_riwayat")}</h3>
          <p className="text-sm text-muted-foreground">{t("lakukan_asesmen_mandiri_atau_ajukan_ment")}</p>
        </div>
      </div>
    );
  }

  // Build trendData for chart (assessment only, sorted asc)
  const trendData = data.history
    .filter(h => h.type === "assessment" && h.total_score !== undefined)
    .map(h => ({
      date: h.date,
      score: h.total_score!,
      chart_data: h.chart_data ?? (h.scores
        ? Object.entries(h.scores).map(([slug, s]) => ({
            subject: slug.charAt(0).toUpperCase() + slug.slice(1),
            score: s.avg,
            fullMark: 5,
          }))
        : []),
    }))
    .reverse();

  const assessments = data.history.filter(h => h.type === "assessment");
  const latestScore = assessments[0]?.total_score ?? 0;
  const firstScore  = assessments[assessments.length - 1]?.total_score ?? latestScore;
  const totalDelta  = latestScore - firstScore;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <TrendingUp className="text-primary h-8 w-8" />
          Riwayat Perkembangan
        </h2>
        <p className="text-muted-foreground text-sm">
          Timeline perjalanan kematangan digital <span className="font-bold text-foreground">{data.umkm_name}</span>.
        </p>
      </div>

      {/* ── Trend chart (only if ≥2 assessments) ── */}
      {trendData.length >= 2 && (
        <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Grafik Perkembangan Skor</CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    Progres maturity UMKM dari assessment ke assessment. Hover titik untuk rincian dimensi.
                  </CardDescription>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-medium">Total Progres</p>
                  <p
                    className="text-lg font-black flex items-center gap-1"
                    style={{ color: totalDelta >= 0 ? "#22c55e" : "#ef4444" }}
                  >
                    {totalDelta >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {Math.abs(totalDelta).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-medium">Skor Terkini</p>
                  <p className="text-lg font-black text-primary">{latestScore.toFixed?.(2) ?? latestScore}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <MaturityTrendChart data={trendData} />
          </CardContent>
        </Card>
      )}

      {/* ── Timeline ── */}
      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 via-border/50 to-border/20 hidden md:block" />

        <div className="space-y-8">
          {data.history.map((item, idx) => {
            const isAssessment = item.type === "assessment";
            const prevItem = data.history[idx + 1];
            const isLevelUp =
              isAssessment &&
              prevItem?.type === "assessment" &&
              item.level !== prevItem.level;
            const prevScore = isAssessment && prevItem?.type === "assessment"
              ? (prevItem.total_score ?? 0)
              : null;
            const scoreDelta = prevScore !== null && item.total_score !== undefined
              ? item.total_score - prevScore
              : null;

            return (
              <div key={idx} className="relative md:pl-20">
                {/* Timeline dot */}
                <div
                  className={`absolute left-4 top-3 h-5 w-5 rounded-full border-4 border-background z-10 hidden md:block shadow-lg ${
                    isAssessment
                      ? "bg-primary ring-4 ring-primary/15"
                      : "bg-emerald-500 ring-4 ring-emerald-500/15"
                  }`}
                />

                {/* Date tag */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} className="text-muted-foreground" />
                  <span className="text-[11px] font-bold text-muted-foreground tracking-widest">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {scoreDelta !== null && (
                    <span
                      className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{
                        background:
                          scoreDelta > 0
                            ? "rgba(34,197,94,0.12)"
                            : scoreDelta < 0
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(100,116,139,0.1)",
                        color:
                          scoreDelta > 0
                            ? "#22c55e"
                            : scoreDelta < 0
                            ? "#ef4444"
                            : "#64748b",
                      }}
                    >
                      {scoreDelta > 0 ? <ArrowUp size={9} /> : scoreDelta < 0 ? <ArrowDown size={9} /> : <Minus size={9} />}
                      {scoreDelta > 0 ? "+" : ""}{scoreDelta.toFixed(2)}
                    </span>
                  )}
                </div>

                <Card
                  className={`overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 ${
                    isLevelUp ? "ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                      {/* ── LEFT: Main Content ── */}
                      <div className={`p-6 lg:col-span-7 flex flex-col justify-center ${!isAssessment ? "bg-emerald-500/5" : ""}`}>

                        {/* Type badge + title */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isAssessment
                              ? "bg-primary/10 text-primary"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {isAssessment ? <BarChart3 size={20} /> : <MessageSquare size={20} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                              {isAssessment ? "Audit Kemandirian" : "Sesi Pendampingan"}
                            </p>
                            <h4 className="font-bold text-base leading-tight">
                              {isAssessment ? "Asesmen Kemandirian Digital" : item.topic}
                            </h4>
                          </div>
                        </div>

                        {isAssessment ? (
                          <div className="space-y-4">
                            {/* Score + Level */}
                            <div className="flex flex-wrap gap-3">
                              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 min-w-[110px]">
                                <p className="text-[10px] font-bold text-muted-foreground mb-1">Skor Total</p>
                                <p className="text-2xl font-black text-foreground">{item.total_score}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 min-w-[140px]">
                                <p className="text-[10px] font-bold text-primary mb-1">Level Maturity</p>
                                <p className="text-base font-bold text-primary">{item.level}</p>
                              </div>
                            </div>

                            {item.is_mentoring && (
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                                <Sparkles size={10} className="mr-1" /> Hasil Mentoring
                              </Badge>
                            )}

                            {item.triggered_by_project && item.project_title && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                                📋 Dipicu proyek: {item.project_title}
                              </span>
                            )}

                            {isLevelUp && (
                              <div className="mt-2 p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-4 animate-in slide-in-from-left duration-500">
                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                  <Award size={24} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black tracking-widest opacity-80">
                                    {t("level_up_achievement")}
                                  </p>
                                  <p className="font-bold text-lg leading-tight">Naik ke {item.level}</p>
                                  <p className="text-[10px] opacity-70 mt-0.5 italic">
                                    {t("berdasarkan_peningkatan_skor_pada_katego")}
                                  </p>
                                </div>
                                <Trophy className="ml-auto opacity-25 h-12 w-12" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                              &quot;{item.desc}&quot;
                            </p>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {t("selesai_didampingi_oleh_advisor")}
                              </span>
                            </div>
                            {item.advisor_name && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                                <div className="h-7 w-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                                  {item.advisor_photo ? (
                                    <img src={item.advisor_photo} alt={item.advisor_name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-black text-primary">{item.advisor_name.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Pendamping</p>
                                  <p className="text-xs font-bold">{item.advisor_name}</p>
                                </div>
                              </div>
                            )}
                            {item.project_title && (
                              <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full border border-primary/20 inline-block mt-1">
                                📋 {item.project_title}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── RIGHT: Visualization Sidebar ── */}
                      {isAssessment && item.scores && (
                        <div
                          className="lg:col-span-5 border-l border-border/50 flex flex-col"
                          style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.8)" }}
                        >
                          {/* Tab toggle */}
                          <div className="flex border-b border-border/50">
                            <button
                              onClick={() => setChartView("radar")}
                              className={`flex-1 text-[10px] font-bold py-2.5 transition-colors ${
                                chartView === "radar"
                                  ? "bg-primary/8 text-primary border-b-2 border-primary"
                                  : "text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              Radar
                            </button>
                            <button
                              onClick={() => setChartView("bars")}
                              className={`flex-1 text-[10px] font-bold py-2.5 transition-colors ${
                                chartView === "bars"
                                  ? "bg-primary/8 text-primary border-b-2 border-primary"
                                  : "text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              Dimensi
                            </button>
                          </div>

                          <div className="flex-1 flex items-center justify-center p-4">
                            {chartView === "radar" ? (
                              <CompactRadar scores={item.scores} isDark={isDark} />
                            ) : (
                              <DimBarList scores={item.scores} isDark={isDark} />
                            )}
                          </div>
                        </div>
                      )}

                      {!isAssessment && (
                        <div className="lg:col-span-5 p-6 flex items-center justify-center border-l border-border/50"
                          style={{ background: isDark ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.06)" }}
                        >
                          <div className="text-center space-y-3">
                            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
                              <MessageSquare className="h-8 w-8 text-emerald-500" />
                            </div>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                              {t("knowledge_shared")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
