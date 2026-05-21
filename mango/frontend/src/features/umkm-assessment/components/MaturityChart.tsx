"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";

interface DataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface MaturityChartProps {
  data: DataPoint[];
  size?: number;
  showLegend?: boolean;
}

// Color per score tier
function getScoreColor(score: number, fullMark: number) {
  const pct = fullMark > 0 ? score / fullMark : 0;
  if (pct >= 0.7) return { stroke: "#22c55e", fill: "#22c55e", label: "Baik" };
  if (pct >= 0.4) return { stroke: "#f59e0b", fill: "#f59e0b", label: "Sedang" };
  return { stroke: "#ef4444", fill: "#ef4444", label: "Perlu Perhatian" };
}

export default function MaturityChart({ data, size = 340, showLegend = true }: MaturityChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.68;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;
  const maxVal = 5;

  // Colors adapts to theme
  const gridColor   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const axisColor   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const labelColor  = isDark ? "#94a3b8" : "#64748b";
  const scoreColor  = isDark ? "#e2e8f0" : "#0f172a";
  const bgFill      = isDark ? "rgba(30,58,95,0.18)" : "rgba(30,58,95,0.10)";
  const bgStroke    = isDark ? "rgba(99,155,255,0.5)" : "rgba(30,58,95,0.5)";
  const tooltipBg   = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

  // Coordinate helpers
  const getXY = (index: number, val: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (val / maxVal) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelXY = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 26;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [1, 2, 3, 4, 5];
  const ringPaths = rings.map((level) => {
    const pts = data.map((_, i) => {
      const { x, y } = getXY(i, level);
      return `${x},${y}`;
    });
    return pts.join(" ");
  });

  // Data polygon
  const dataPts = data.map((d, i) => getXY(i, d.score));
  const dataPolygon = dataPts.map((p) => `${p.x},${p.y}`).join(" ");

  // Label word wrap helper (max 2 lines)
  const wrapLabel = (subject: string): string[] => {
    const words = subject.split(" ");
    if (words.length <= 2) return [subject];
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="relative" style={{ width: size + 60, height: size + 40 }}>
        <svg
          width={size + 60}
          height={size + 40}
          viewBox={`-30 -20 ${size + 60} ${size + 40}`}
          overflow="visible"
        >
          {/* ── Grid rings ── */}
          {ringPaths.map((pts, i) => (
            <polygon
              key={`ring-${i}`}
              points={pts}
              fill={i === 4 ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(30,58,95,0.02)") : "none"}
              stroke={gridColor}
              strokeWidth={i === 4 ? "1.5" : "1"}
              strokeDasharray={i < 4 ? "3 3" : "0"}
            />
          ))}

          {/* ── Ring level labels (1–5 on top axis) ── */}
          {rings.map((level) => {
            const { x, y } = getXY(0, level);
            return (
              <text
                key={`rlabel-${level}`}
                x={x + 5}
                y={y - 3}
                fontSize="8"
                fill={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
                fontWeight="bold"
              >
                {level}
              </text>
            );
          })}

          {/* ── Axis lines ── */}
          {data.map((_, i) => {
            const outer = getXY(i, maxVal);
            return (
              <line
                key={`axis-${i}`}
                x1={cx} y1={cy}
                x2={outer.x} y2={outer.y}
                stroke={axisColor}
                strokeWidth="1.5"
              />
            );
          })}

          {/* ── Filled data area ── */}
          <polygon
            points={dataPolygon}
            fill={bgFill}
            stroke={bgStroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* ── Per-dimension colored segment highlights ── */}
          {data.map((d, i) => {
            const next = (i + 1) % n;
            const p0 = { x: cx, y: cy };
            const p1 = dataPts[i];
            const p2 = dataPts[next];
            const { fill } = getScoreColor(d.score, d.fullMark);
            const isHovered = hoveredIndex === i;
            return (
              <polygon
                key={`seg-${i}`}
                points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                fill={fill}
                fillOpacity={isHovered ? 0.25 : 0.08}
                stroke="none"
                style={{ transition: "fill-opacity 0.2s" }}
              />
            );
          })}

          {/* ── Data point dots ── */}
          {dataPts.map((p, i) => {
            const { stroke } = getScoreColor(data[i].score, data[i].fullMark);
            const isHovered = hoveredIndex === i;
            return (
              <g key={`dot-${i}`}>
                {/* Glow ring on hover */}
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? 10 : 0}
                  fill={stroke}
                  fillOpacity={0.2}
                  style={{ transition: "r 0.2s" }}
                />
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? 6 : 4.5}
                  fill={stroke}
                  stroke={isDark ? "#1e293b" : "#fff"}
                  strokeWidth="2"
                  style={{ cursor: "pointer", transition: "r 0.2s" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* ── Labels ── */}
          {data.map((d, i) => {
            const { x, y } = getLabelXY(i);
            const lines = wrapLabel(d.subject);
            const isHovered = hoveredIndex === i;
            const { stroke } = getScoreColor(d.score, d.fullMark);
            let anchor: "start" | "middle" | "end" = "middle";
            if (x < cx - 10) anchor = "end";
            else if (x > cx + 10) anchor = "start";

            return (
              <g
                key={`label-${i}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={x}
                    y={y + li * 13}
                    fontSize="10"
                    fontWeight={isHovered ? "800" : "600"}
                    textAnchor={anchor}
                    fill={isHovered ? stroke : labelColor}
                    style={{ transition: "fill 0.2s, font-weight 0.2s" }}
                  >
                    {line}
                  </text>
                ))}
                {/* Score value below label */}
                <text
                  x={x}
                  y={y + lines.length * 13 + 2}
                  fontSize="11"
                  fontWeight="800"
                  textAnchor={anchor}
                  fill={isHovered ? stroke : scoreColor}
                  style={{ transition: "fill 0.2s" }}
                >
                  {d.score.toFixed(1)}
                  <tspan fontSize="8" fontWeight="600" fill={labelColor}>/5</tspan>
                </text>
              </g>
            );
          })}

          {/* ── Center score badge ── */}
          <circle cx={cx} cy={cy} r={28} fill={isDark ? "#1e3a5f" : "#1e3a5f"} />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="900" fill="#ffffff">
            {(data.reduce((s, d) => s + d.score, 0) / data.length).toFixed(1)}
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.6)">
            RATA-RATA
          </text>
        </svg>
      </div>

      {/* ── Tooltip card (hover info) ── */}
      {hoveredIndex !== null && data[hoveredIndex] && (() => {
        const d = data[hoveredIndex];
        const { stroke, label } = getScoreColor(d.score, d.fullMark);
        const pct = Math.round((d.score / d.fullMark) * 100);
        return (
          <div
            className="mt-2 px-4 py-3 rounded-2xl border text-sm font-medium shadow-lg transition-all"
            style={{
              background: tooltipBg,
              borderColor: tooltipBorder,
              color: tooltipText,
              minWidth: 220,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold text-[13px]">{d.subject}</span>
              <span className="font-black text-base" style={{ color: stroke }}>
                {d.score.toFixed(1)}<span className="text-xs font-normal opacity-60">/5</span>
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: isDark ? "#334155" : "#e2e8f0" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: stroke }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs opacity-60">Capaian: {pct}%</span>
              <span className="text-xs font-bold" style={{ color: stroke }}>{label}</span>
            </div>
          </div>
        );
      })()}

      {/* ── Legend ── */}
      {showLegend && (
        <div className="flex items-center gap-5 mt-4 flex-wrap justify-center">
          {[
            { color: "#22c55e", label: "Baik (≥70%)" },
            { color: "#f59e0b", label: "Sedang (40–69%)" },
            { color: "#ef4444", label: "Perlu Perhatian (<40%)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{ width: 10, height: 10, background: item.color, flexShrink: 0 }}
              />
              <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
