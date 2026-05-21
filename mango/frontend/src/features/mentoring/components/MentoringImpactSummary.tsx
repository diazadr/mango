"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Target, CheckCircle2, BarChart3, 
  ChevronDown, ChevronUp, AlertCircle, Sparkles,
  ArrowRight,
  Trophy
} from "lucide-react";
import { mentoringService } from "../services/mentoringService";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Badge } from "@/src/components/ui/badge";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from "recharts";

interface ImpactCategory {
  id: number;
  name: string;
  slug: string;
  mention_count: number;
}

interface SessionOutput {
  date: string;
  output: string;
}

interface ComparisonData {
  before_level: string;
  after_level: string;
  chart: {
    category: string;
    before: number;
    after: number;
  }[];
}

interface ImpactData {
  improved_categories: ImpactCategory[];
  session_outputs: SessionOutput[];
  measurable_impact_count: number;
  comparison: ComparisonData | null;
}

interface MentoringImpactSummaryProps {
  requestId: number;
}

export function MentoringImpactSummary({ requestId }: MentoringImpactSummaryProps) {
    const t = useTranslations("MentoringImpactSummary");

  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await mentoringService.getImpactSummary(requestId);
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch impact summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, [requestId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 p-4">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!data || (data.improved_categories.length === 0 && data.session_outputs.length === 0 && !data.comparison)) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground text-xs">
        <AlertCircle size={14} />
        <span>{t("belum_ada_catatan_dampak_penda")}</span>
      </div>
    );
  }

  const maxCount = Math.max(...(data.improved_categories.map(c => c.mention_count) || [1]), 1);

  return (
    <SectionCard title={t("dampak_pendampingan")} icon={TrendingUp} className="rounded-xl border-primary/10">
      <div className="space-y-6">
        
        {/* Comparison Radar Chart */}
        {data.comparison && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-muted-foreground" />
              <p className="text-xs font-bold text-muted-foreground tracking-wide">{t("perkembangan_skor")}</p>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.comparison.chart}>
                  <PolarGrid strokeOpacity={0.1} />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.7 }} 
                  />
                  <Radar
                    name="Sebelum"
                    dataKey="before"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Sesudah"
                    dataKey="after"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.5}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Level Change */}
            <div className="flex items-center justify-center gap-4 py-2">
               <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-bold">{t("awal")}</p>
                  <Badge variant="outline" className="mt-1">{data.comparison.before_level}</Badge>
               </div>
               <ArrowRight className="text-muted-foreground h-4 w-4 mt-4" />
               <div className="text-center">
                  <p className="text-[10px] text-primary font-bold">{t("sekarang")}</p>
                  <Badge className="mt-1 bg-primary text-primary-foreground">{data.comparison.after_level}</Badge>
               </div>
               {data.comparison.before_level !== data.comparison.after_level && (
                 <div className="flex items-center gap-1.5 ml-2 text-success animate-bounce">
                    <Trophy size={16} />
                    <span className="text-xs font-black italic">{t("level_up")}</span>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Measurable Impact Count */}
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("sesi_berdampak_terukur")}</p>
            <p className="text-2xl font-black text-primary">{data.measurable_impact_count}</p>
          </div>
        </div>

        {/* Kategori yang diperbaiki */}
        {data.improved_categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-muted-foreground" />
              <p className="text-xs font-bold text-muted-foreground tracking-wide">{t("kategori_yang_diperbaiki")}</p>
            </div>
            <div className="space-y-2.5">
              {data.improved_categories.map((cat) => {
                const pct = Math.round((cat.mention_count / maxCount) * 100);
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] font-black px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
                      >
                        {cat.mention_count}×
                      </Badge>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Output Sesi */}
        {data.session_outputs.length > 0 && (
          <div className="space-y-3">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground tracking-wide">
                  Output Sesi ({data.session_outputs.length})
                </p>
              </div>
              {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </button>
            
            {expanded && (
              <div className="space-y-2.5 pl-2 border-l-2 border-primary/20">
                {data.session_outputs.map((output, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-primary shrink-0" />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {output.date ? new Date(output.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanpa Tanggal'}
                      </span>
                    </div>
                    <p className="text-xs text-foreground ml-4 leading-relaxed">{output.output}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
