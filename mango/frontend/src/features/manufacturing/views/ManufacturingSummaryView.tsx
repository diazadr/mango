"use client";

import { useEffect, useState } from "react";
import { Factory, ClipboardList, BellDot, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { manufacturingService } from "@/src/features/manufacturing/services/manufacturingService";
import { EdgeSyncStatusPanel } from "../components/EdgeSyncStatusPanel";

interface EdgeInfo {
    site_id: string;
    production_logs: number;
    alarm_logs: number;
}

interface Summary {
    work_orders: { total: number; draft: number; released: number; in_progress: number; completed: number };
    production: { records: number; good_quantity: number; reject_quantity: number };
    alarms: { open: number; resolved: number; critical_open: number };
    edge?: EdgeInfo;
}

const SEVERITY_STYLES: Record<string, string> = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
};

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    released: "bg-primary/10 text-primary",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
};

export function ManufacturingSummaryView() {
    const t = useTranslations("ManufacturingPage");
    const ts = useTranslations("ManufacturingSummaryView");
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recentWO, setRecentWO] = useState<any[]>([]);
    const [activeAlarms, setActiveAlarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [sumRes, woRes, alarmRes] = await Promise.all([
                    manufacturingService.getSummary(),
                    manufacturingService.getWorkOrders({ per_page: 5 }),
                    manufacturingService.getAlarmEvents({ status: "open", per_page: 5 }),
                ]);
                setSummary(sumRes.data?.data ?? null);
                
                const woData = woRes.data?.data;
                setRecentWO(Array.isArray(woData) ? woData : (woData?.data ?? []));
                
                const alarmData = alarmRes.data?.data;
                setActiveAlarms(Array.isArray(alarmData) ? alarmData : (alarmData?.data ?? []));
            } catch {
                // silent — page-level error
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const edgeInfo = summary?.edge ?? null;

    const metrics = summary
        ? [
              {
                  title: t("total_work_orders"),
                  value: summary.work_orders.total,
                  icon: ClipboardList,
                  trend: `${summary.work_orders.in_progress} ${t("in_progress")}`,
                  iconColor: "text-primary",
                  iconBg: "bg-primary/10",
              },
              {
                  title: t("completed"),
                  value: summary.work_orders.completed,
                  icon: CheckCircle2,
                  trend: `${summary.work_orders.released} ${t("status_released").toLowerCase()}`,
                  iconColor: "text-success",
                  iconBg: "bg-success/10",
              },
              {
                  title: t("good_quantity"),
                  value: summary.production.good_quantity.toLocaleString(),
                  icon: TrendingUp,
                  trend: `${summary.production.records} ${t("records").toLowerCase()}`,
                  iconColor: "text-success",
                  iconBg: "bg-success/10",
              },
              {
                  title: t("open_alarms"),
                  value: summary.alarms.open,
                  icon: BellDot,
                  trend: `${summary.alarms.critical_open} ${t("severity_critical").toLowerCase()}`,
                  iconColor: summary.alarms.critical_open > 0 ? "text-destructive" : "text-warning",
                  iconBg: summary.alarms.critical_open > 0 ? "bg-destructive/10" : "bg-warning/10",
                  accent: summary.alarms.critical_open > 0,
              },
          ]
        : [];

    return (
        <DashboardPageShell
            title={t("summary_title")}
            subtitle={t("summary_subtitle")}
            icon={Factory}
        >
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Edge Sync Status */}
                    <EdgeSyncStatusPanel loading={loading} />
                    {/* Metric Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((m) => (
                            <MetricCard
                                key={m.title}
                                title={m.title}
                                value={m.value}
                                trend={m.trend}
                                icon={m.icon}
                                iconColor={m.iconColor}
                                iconBg={m.iconBg}
                                accent={m.accent}
                            />
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Kapasitas Produksi Consolidation */}
                        <SectionCard
                            title={ts("title_kapasitas_produksi_terdaftar")}
                            icon={TrendingUp}
                            className="lg:col-span-5"
                            noPadding
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                                <div className="p-6">
                                    <p className="text-[10px] font-black text-muted-foreground tracking-wide mb-1">{ts("target_harian_avg")}</p>
                                     <p className="text-2xl font-black text-primary">
                                        {summary ? `${(summary.production.good_quantity / Math.max(summary.production.records || 1, 1)).toFixed(0)}` : "—"}
                                        <small className="text-xs font-bold text-muted-foreground"> unit/WO</small>
                                     </p>
                                     <p className="text-[10px] text-success font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={10} /> {ts("sesuai_kapasitas_terpasang")}</p>
                                </div>
                                <div className="p-6">
                                    <p className="text-[10px] font-black text-muted-foreground tracking-wide mb-1">{ts("utilisasi_mesin")}</p>
                                    {(() => {
                                        const pct = summary && summary.work_orders.total > 0
                                            ? Math.min(100, Math.round((summary.work_orders.in_progress / Math.max(summary.work_orders.total, 1)) * 100))
                                            : 0;
                                        return (
                                            <>
                                                <p className="text-2xl font-black text-primary">{pct}%</p>
                                                <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                                                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="p-6">
                                    <p className="text-[10px] font-black text-muted-foreground tracking-wide mb-1">{ts("produk_aktif")}</p>
                                    <p className="text-2xl font-black text-primary">{recentWO.length} <small className="text-xs font-bold text-muted-foreground">{ts("sku_berjalan")}</small></p>
                                    <Link href="/workspace/manufacturing/products" className="text-[10px] text-primary font-bold mt-2 hover:underline inline-block">
                                        Kelola Produk & Kapasitas →
                                    </Link>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Recent Work Orders */}
                        <SectionCard
                            title={t("recent_work_orders")}
                            icon={ClipboardList}
                            className="lg:col-span-3"
                            headerAction={
                                <Link href="/workspace/manufacturing/work-orders">
                                    <Button variant="ghost" size="sm" className="text-xs h-7">
                                        {t("view_all")} →
                                    </Button>
                                </Link>
                            }
                            noPadding
                        >
                            {recentWO.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">{t("empty_work_orders")}</p>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentWO.map((wo: any) => (
                                        <div key={wo.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">{wo.code}</p>
                                                <p className="text-xs text-muted-foreground truncate">{wo.title}</p>
                                                {wo.machine && (
                                                    <p className="text-[10px] text-muted-foreground/70 tracking-wide">{wo.machine.name}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[wo.status] ?? "bg-muted text-muted-foreground"}`}>
                                                    {t(`status_${wo.status}`)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {wo.completed_quantity}/{wo.target_quantity} pcs
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Active Alarms */}
                        <SectionCard
                            title={t("active_alarms")}
                            icon={BellDot}
                            className="lg:col-span-2"
                            badge={
                                activeAlarms.length > 0 ? (
                                    <Badge variant="destructive" className="text-[10px] font-bold">
                                        {activeAlarms.length} {t("status_open").toLowerCase()}
                                    </Badge>
                                ) : undefined
                            }
                            headerAction={
                                <Link href="/workspace/manufacturing/alarms">
                                    <Button variant="ghost" size="sm" className="text-xs h-7">
                                        {t("view_all")} →
                                    </Button>
                                </Link>
                            }
                            noPadding
                        >
                            {activeAlarms.length === 0 ? (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-success" />
                                    <p className="text-sm text-muted-foreground">{t("no_active_alarms")}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {activeAlarms.map((alarm: any) => (
                                        <div key={alarm.id} className="px-5 py-3 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-foreground truncate">{alarm.message}</p>
                                                    <p className="text-[10px] text-muted-foreground">{alarm.machine?.name ?? "—"}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${SEVERITY_STYLES[alarm.severity] ?? "bg-muted text-muted-foreground"}`}>
                                                    {t(`severity_${alarm.severity}`)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            )}
        </DashboardPageShell>
    );
}
