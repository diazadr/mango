"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import {
    Gauge, Activity, TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
    Loader2, CheckCircle2, XCircle, Factory, Cpu, BarChart3
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { manufacturingService } from "../services/manufacturingService";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
    ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from "recharts";

interface OEEMachine {
    machine_id: number | null;
    machine_code: string;
    machine_name: string;
    avg_oee: number;
    avg_availability: number;
    avg_performance: number;
    avg_quality: number;
    total_downtime_min: number;
    total_good: number;
    total_defect: number;
    oee_status: "world_class" | "average" | "poor";
}

interface OEEHistory {
    date: string;
    avg_oee: number;
    avg_availability: number;
    avg_performance: number;
    avg_quality: number;
    total_downtime_min: number;
}

type Period = "today" | "week" | "month";

function OEEGaugeCard({ machine }: { machine: OEEMachine }) {
    const t = useTranslations("OEEDashboardView");
    
    const OEE_THRESHOLD = {
        world_class: { min: 85, color: "text-success", bg: "bg-success", ring: "ring-success/30", label: t("status_world_class") },
        average: { min: 60, color: "text-warning", bg: "bg-warning", ring: "ring-warning/30", label: t("status_average") },
        poor: { min: 0, color: "text-destructive", bg: "bg-destructive", ring: "ring-destructive/30", label: t("status_poor") },
    };

    const threshold = OEE_THRESHOLD[machine.oee_status];
    const oee = Number(machine.avg_oee ?? 0);

    // SVG arc gauge
    const radius = 52;
    const circumference = Math.PI * radius;
    const strokeDash = (oee / 100) * circumference;

    const arcColor = machine.oee_status === "world_class"
        ? "#22c55e"
        : machine.oee_status === "average"
            ? "#f59e0b"
            : "#ef4444";

    return (
        <div className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border bg-card shadow-sm ring-2 ${threshold.ring} transition-all hover:shadow-md`}>
            {/* Machine name */}
            <div className="text-center">
                <p className="text-xs font-bold tracking-wide text-muted-foreground">{machine.machine_code}</p>
                <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{machine.machine_name}</p>
            </div>

            {/* SVG Half-circle gauge */}
            <div className="relative w-32 h-16 overflow-hidden">
                <svg viewBox="0 0 120 60" className="w-32 h-16">
                    {/* Background arc */}
                    <path
                        d="M 10 60 A 50 50 0 0 1 110 60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="text-muted/30"
                    />
                    {/* Value arc */}
                    <path
                        d="M 10 60 A 50 50 0 0 1 110 60"
                        fill="none"
                        stroke={arcColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(oee / 100) * 157} 157`}
                        className="transition-all duration-700"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                    <span className={`text-xl font-black ${threshold.color}`}>
                        {oee.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Status badge */}
            <Badge
                className={`text-[10px] font-bold ${
                    machine.oee_status === "world_class"
                        ? "bg-success/15 text-success border-success/20"
                        : machine.oee_status === "average"
                            ? "bg-warning/15 text-warning border-warning/20"
                            : "bg-destructive/15 text-destructive border-destructive/20"
                }`}
                variant="outline"
            >
                {threshold.label}
            </Badge>

            {/* Sub metrics */}
            <div className="w-full grid grid-cols-3 gap-1 mt-1">
                {[
                    { label: "Availability", value: Number(machine.avg_availability ?? 0) },
                    { label: "Performance", value: Number(machine.avg_performance ?? 0) },
                    { label: "Quality", value: Number(machine.avg_quality ?? 0) },
                ].map((m) => (
                    <div key={m.label} className="text-center">
                        <p className="text-[9px] font-medium text-muted-foreground tracking-wide">{m.label}</p>
                        <p className="text-xs font-bold text-foreground">{(m.value ?? 0).toFixed(1)}%</p>
                    </div>
                ))}
            </div>

            {/* Production info */}
            <div className="w-full flex justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                <span>✅ OK: <b className="text-foreground">{machine.total_good.toLocaleString()}</b></span>
                <span>❌ NG: <b className="text-destructive">{machine.total_defect.toLocaleString()}</b></span>
                <span>⏱ DT: <b className="text-warning">{Number(machine.total_downtime_min ?? 0).toFixed(0)} min</b></span>
            </div>
        </div>
    );
}

function OEEHistoryChart({ history }: { history: OEEHistory[] }) {
    const t = useTranslations("OEEDashboardView");
    if (!history.length) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">{t("no_history")}</p>
            </div>
        );
    }

    const formatted = history.map(h => ({
        date: h.date.slice(5),
        OEE: parseFloat(Number(h.avg_oee ?? 0).toFixed(1)),
        Availability: parseFloat(Number(h.avg_availability ?? 0).toFixed(1)),
        Performance: parseFloat(Number(h.avg_performance ?? 0).toFixed(1)),
        Quality: parseFloat(Number(h.avg_quality ?? 0).toFixed(1)),
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={formatted} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                    formatter={(v: any) => [`${v}%`]}
                />
                <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "85%", position: "right", fontSize: 9, fill: "#22c55e" }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "60%", position: "right", fontSize: 9, fill: "#f59e0b" }} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Line type="monotone" dataKey="OEE" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Availability" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="Performance" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="Quality" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function OEEDashboardView() {
    const t = useTranslations("OEEDashboardView");
    const [period, setPeriod] = useState<Period>("week");
    const [siteId, setSiteId] = useState<string>("");
    const [sites, setSites] = useState<{ site_id: string; name: string }[]>([]);
    const [oeeData, setOeeData] = useState<OEEMachine[]>([]);
    const [history, setHistory] = useState<OEEHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // Load available sites for filter
    useEffect(() => {
        manufacturingService.getEdgeSites()
            .then(res => {
                const s = res.data?.data?.sites ?? [];
                setSites(s.map((x: any) => ({ site_id: x.site_id, name: x.name })));
            })
            .catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { period };
            if (siteId) params.site_id = siteId;

            const [oeeRes, historyRes] = await Promise.all([
                manufacturingService.getOEE(params),
                manufacturingService.getOEEHistory({
                    days: period === "today" ? 1 : period === "week" ? 7 : 30,
                    ...(siteId ? { site_id: siteId } : {}),
                }),
            ]);
            setOeeData(oeeRes.data?.data?.machines ?? []);
            setHistory(historyRes.data?.data?.history ?? []);
            setLastRefresh(new Date());
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [period, siteId]);

    useEffect(() => {
        load();
        const timer = setInterval(load, 30_000);
        return () => clearInterval(timer);
    }, [load]);

    const avgOEE = oeeData.length
        ? oeeData.reduce((s, m) => s + Number(m.avg_oee ?? 0), 0) / oeeData.length
        : 0;

    const worldClass = oeeData.filter(m => m.oee_status === "world_class").length;
    const poor = oeeData.filter(m => m.oee_status === "poor").length;

    return (
        <DashboardPageShell
            title={t("title_dashboard_oee")}
            subtitle={t("title_overall_equipment_effectiveness_data_rea")}
            actions={
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Site filter */}
                    {sites.length > 0 && (
                        <select
                            value={siteId}
                            onChange={e => setSiteId(e.target.value)}
                            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="">{t("all_sites")}</option>
                            {sites.map(s => (
                                <option key={s.site_id} value={s.site_id}>{s.name} ({s.site_id})</option>
                            ))}
                        </select>
                    )}
                    {/* Period tabs */}
                    <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
                        {(["today", "week", "month"] as Period[]).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                    period === p
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {p === "today" ? t("today") : p === "week" ? t("week") : t("month")}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={load}
                        className="gap-2 h-9 rounded-xl"
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            }
        >
            {loading && oeeData.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                label: t("avg_oee"),
                                value: `${avgOEE.toFixed(1)}%`,
                                icon: Gauge,
                                color: avgOEE >= 85 ? "text-success" : avgOEE >= 60 ? "text-warning" : "text-destructive",
                                bg: avgOEE >= 85 ? "bg-success/10" : avgOEE >= 60 ? "bg-warning/10" : "bg-destructive/10",
                            },
                            {
                                label: t("active_machines"),
                                value: oeeData.length,
                                icon: Cpu,
                                color: "text-primary",
                                bg: "bg-primary/10",
                            },
                            {
                                label: t("world_class"),
                                value: worldClass,
                                icon: CheckCircle2,
                                color: "text-success",
                                bg: "bg-success/10",
                            },
                            {
                                label: t("needs_attention"),
                                value: poor,
                                icon: AlertTriangle,
                                color: poor > 0 ? "text-destructive" : "text-muted-foreground",
                                bg: poor > 0 ? "bg-destructive/10" : "bg-muted/30",
                            },
                        ].map((m) => (
                            <div key={m.label} className="flex items-center gap-3 p-4 rounded-2xl border bg-card shadow-sm">
                                <div className={`p-2 rounded-xl ${m.bg}`}>
                                    <m.icon className={`h-5 w-5 ${m.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground tracking-wide">{m.label}</p>
                                    <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* OEE per Machine */}
                    <SectionCard title={t("oee_per_machine")} icon={Factory}>
                        {oeeData.length === 0 ? (
                            <div className="flex flex-col items-center py-12 gap-3">
                                <Cpu className="h-10 w-10 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">
                                    Belum ada data OEE. Pastikan edge system mengirimkan data ke MANGO.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                                {oeeData.map((machine) => (
                                    <OEEGaugeCard key={machine.machine_code} machine={machine} />
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* OEE History Chart */}
                    <SectionCard title={t("oee_trend")} icon={BarChart3}>
                        <div className="p-5">
                            <p className="text-xs text-muted-foreground mb-4">
                                Rata-rata OEE harian semua mesin. Garis hijau = world class (85%), garis kuning = average (60%).
                            </p>
                            <OEEHistoryChart history={history} />
                        </div>
                    </SectionCard>

                    {/* Last refresh info */}
                    {lastRefresh && (
                        <p className="text-[10px] text-muted-foreground text-center">
                            {t("last_updated", { time: lastRefresh.toLocaleTimeString("id-ID") })}
                        </p>
                    )}
                </div>
            )}
        </DashboardPageShell>
    );
}
