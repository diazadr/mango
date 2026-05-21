"use client";

import React, { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  LineChart, Line, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";

interface TrendData {
  date: string;
  score: number;
  chart_data?: any[];
}

interface MaturityTrendChartProps {
  data: TrendData[];
}

// Level thresholds
const LEVEL_LINES = [
  { value: 1.8, label: "L1→L2", color: "#ef4444" },
  { value: 2.6, label: "L2→L3", color: "#f59e0b" },
  { value: 3.4, label: "L3→L4", color: "#3b82f6" },
  { value: 4.2, label: "L4→L5", color: "#8b5cf6" },
];

function getScoreColor(score: number) {
  if (score >= 4.2) return "#8b5cf6";
  if (score >= 3.4) return "#3b82f6";
  if (score >= 2.6) return "#22c55e";
  if (score >= 1.8) return "#f59e0b";
  return "#ef4444";
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const isPositive = d?.delta > 0;
  const isNeutral = d?.delta === 0;
  const color = getScoreColor(d?.score ?? 0);

  return (
    <div
      className="rounded-2xl border shadow-2xl p-4 min-w-[260px]"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderColor: isDark ? "#1e293b" : "#e2e8f0",
        color: isDark ? "#f1f5f9" : "#0f172a",
      }}
    >
      <p className="text-[11px] font-bold tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border/40">
        {label}
      </p>

      {/* Total score */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground">Skor Total</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black" style={{ color }}>{d?.score?.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground font-normal">/5</span>
          {d?.delta !== 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isPositive
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(239,68,68,0.12)",
                color: isPositive ? "#22c55e" : "#ef4444",
              }}
            >
              {isPositive ? "+" : ""}{d?.delta?.toFixed(2)}
            </span>
          )}
          {isNeutral && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
              =
            </span>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-4">
        <div
          className="h-full rounded-full"
          style={{ width: `${(d?.score / 5) * 100}%`, background: color, transition: "width 0.4s" }}
        />
      </div>

      {/* Per-dimension breakdown */}
      {d?.categoryDetails?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase mb-2">Rincian Dimensi</p>
          {d.categoryDetails.map((cat: any, idx: number) => {
            const pct = Math.round((cat.score / 5) * 100);
            const catColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
            return (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="text-[10px] truncate"
                  style={{ width: 110, color: isDark ? "#94a3b8" : "#64748b", flexShrink: 0 }}
                >
                  {cat.subject}
                </span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: catColor }}
                  />
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: catColor, width: 28, textAlign: "right" }}>
                  {cat.score?.toFixed(1)}
                </span>
                {cat.delta > 0 && (
                  <span className="text-[9px] font-bold text-green-500 shrink-0">+{cat.delta.toFixed(1)}</span>
                )}
                {cat.delta < 0 && (
                  <span className="text-[9px] font-bold text-red-500 shrink-0">{cat.delta.toFixed(1)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = getScoreColor(payload.score);
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="white" strokeWidth={2} />
    </g>
  );
};

const CustomActiveDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = getScoreColor(payload.score);
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.3} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2.5} />
    </g>
  );
};

type ViewMode = "total" | "dimension";

export default function MaturityTrendChart({ data }: MaturityTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [viewMode, setViewMode] = useState<ViewMode>("total");
  const [showLevels, setShowLevels] = useState(true);

  const gridColor   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const axisColor   = isDark ? "#475569" : "#94a3b8";
  const refColor    = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs italic">
        Belum ada data historis untuk menampilkan grafik tren.
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedData.map((d, i) => {
    const prevScore = i > 0 ? sortedData[i - 1].score : d.score;
    const delta = d.score - prevScore;
    const categoryDetails: any[] = [];
    if (d.chart_data) {
      const prevCats = i > 0 && sortedData[i - 1].chart_data ? sortedData[i - 1].chart_data : null;
      d.chart_data.forEach((cat: any) => {
        let catDelta = 0;
        if (prevCats) {
          const prev = prevCats.find((p: any) => p.subject === cat.subject);
          if (prev) catDelta = cat.score - prev.score;
        }
        categoryDetails.push({ subject: cat.subject, score: cat.score, delta: catDelta });
      });
    }
    return {
      ...d,
      name: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" }),
      delta,
      categoryDetails,
    };
  });

  // Gather all unique dimensions for multi-line chart
  const allDimensions: string[] = useMemo(() => {
    const dims = new Set<string>();
    chartData.forEach(d => d.categoryDetails?.forEach((c: any) => dims.add(c.subject)));
    return Array.from(dims);
  }, [chartData]);

  const DIM_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  const dimensionChartData = chartData.map(d => {
    const row: any = { name: d.name };
    d.categoryDetails?.forEach((c: any) => { row[c.subject] = parseFloat(c.score.toFixed(2)); });
    return row;
  });

  // Stats
  const scores = chartData.map(d => d.score);
  const latest = scores[scores.length - 1];
  const first  = scores[0];
  const maxScore = Math.max(...scores);
  const totalDelta = latest - first;
  const latestColor = getScoreColor(latest);

  return (
    <div className="space-y-4">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Skor Terkini",
            value: latest?.toFixed(2),
            sub: "dari skala 5.0",
            icon: <TrendingUp size={16} />,
            color: latestColor,
          },
          {
            label: "Total Progres",
            value: (totalDelta >= 0 ? "+" : "") + totalDelta.toFixed(2),
            sub: `${sortedData.length} assessment`,
            icon: totalDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
            color: totalDelta >= 0 ? "#22c55e" : "#ef4444",
          },
          {
            label: "Skor Tertinggi",
            value: maxScore.toFixed(2),
            sub: "sepanjang riwayat",
            icon: <ArrowUpRight size={16} />,
            color: "#8b5cf6",
          },
          {
            label: "Jumlah Assessment",
            value: sortedData.length,
            sub: "total evaluasi",
            icon: <Minus size={16} />,
            color: "#3b82f6",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/40 px-4 py-3 flex items-center gap-3"
            style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
          >
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ background: `${stat.color}20`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toggle controls ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-xl overflow-hidden border border-border/50 text-xs font-bold">
          <button
            onClick={() => setViewMode("total")}
            className={`px-4 py-2 transition-colors ${
              viewMode === "total"
                ? "bg-primary text-white"
                : "bg-transparent text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Skor Total
          </button>
          <button
            onClick={() => setViewMode("dimension")}
            className={`px-4 py-2 transition-colors ${
              viewMode === "dimension"
                ? "bg-primary text-white"
                : "bg-transparent text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Per Dimensi
          </button>
        </div>

        {viewMode === "total" && (
          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors ${
              showLevels
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-transparent text-muted-foreground border-border/50 hover:bg-muted/30"
            }`}
          >
            {showLevels ? "✓" : ""} Garis Level
          </button>
        )}
      </div>

      {/* ── Chart area ── */}
      <div
        className="w-full rounded-2xl border border-border/40 p-4"
        style={{ background: isDark ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.8)" }}
      >
        {viewMode === "total" ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: axisColor }}
                dy={8}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: axisColor }}
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              {showLevels && LEVEL_LINES.map((l) => (
                <ReferenceLine
                  key={l.value}
                  y={l.value}
                  stroke={l.color}
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                  label={{
                    value: l.label,
                    position: "insideBottomRight",
                    fontSize: 9,
                    fontWeight: 700,
                    fill: l.color,
                    opacity: 0.7,
                  }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#scoreGrad)"
                animationDuration={1200}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dimensionChartData} margin={{ top: 20, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: axisColor }}
                dy={8}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: axisColor }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                  background: isDark ? "#0f172a" : "#fff",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  fontSize: 11,
                  fontWeight: 600,
                }}
                formatter={(val: any, name: any) => [`${Number(val).toFixed(1)}/5`, name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 12 }}
              />
              {allDimensions.map((dim, i) => (
                <Line
                  key={dim}
                  type="monotone"
                  dataKey={dim}
                  stroke={DIM_COLORS[i % DIM_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: DIM_COLORS[i % DIM_COLORS.length], stroke: "white", strokeWidth: 1.5 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Level legend (only in total mode) ── */}
      {viewMode === "total" && showLevels && (
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {LEVEL_LINES.map((l) => (
            <div key={l.value} className="flex items-center gap-1.5">
              <div
                className="h-0.5 w-6 rounded"
                style={{ background: l.color, borderTop: `2px dashed ${l.color}` }}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">{l.label} ({l.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
