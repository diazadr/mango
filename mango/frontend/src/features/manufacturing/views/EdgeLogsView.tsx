"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import {
    Activity, BellDot, RefreshCw, Loader2, Filter,
    ChevronLeft, ChevronRight, Database, Wifi
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { manufacturingService } from "../services/manufacturingService";

const SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
    critical:  { label: "Kritis",      className: "bg-destructive/15 text-destructive border-destructive/30" },
    emergency: { label: "Darurat",     className: "bg-destructive/20 text-destructive border-destructive/40" },
    warning:   { label: "Peringatan",  className: "bg-warning/15 text-warning border-warning/30" },
    info:      { label: "Info",        className: "bg-primary/10 text-primary border-primary/20" },
};

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEVERITY_CONFIG[severity?.toLowerCase()] ?? { label: severity, className: "bg-muted text-muted-foreground" };
    return (
        <Badge variant="outline" className={`text-[10px] font-bold capitalize ${cfg.className}`}>
            {cfg.label}
        </Badge>
    );
}

function SiteBadge({ siteId }: { siteId: string }) {
    return (
        <Badge variant="outline" className="font-mono text-[9px] bg-primary/5 text-primary border-primary/20">
            <Wifi size={8} className="mr-0.5" />
            {siteId}
        </Badge>
    );
}

function ProdLogTable({ logs, loading }: { logs: any[]; loading: boolean }) {
    const t = useTranslations("EdgeLogsView");
    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
    if (!logs.length) return (
        <div className="flex flex-col items-center py-10 gap-2">
            <Database className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("belum_ada_log_produksi_edge")}</p>
        </div>
    );
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left px-4 py-2.5 font-semibold">{t("site")}</th>
                        <th className="text-left px-4 py-2.5 font-semibold">{t("mesin")}</th>
                        <th className="text-left px-4 py-2.5 font-semibold">{t("wo_part")}</th>
                        <th className="text-center px-4 py-2.5 font-semibold">{t("shift")}</th>
                        <th className="text-right px-4 py-2.5 font-semibold">{t("oee")}</th>
                        <th className="text-right px-4 py-2.5 font-semibold">OK</th>
                        <th className="text-right px-4 py-2.5 font-semibold">NG</th>
                        <th className="text-right px-4 py-2.5 font-semibold">{t("dt_min")}</th>
                        <th className="text-right px-4 py-2.5 font-semibold">{t("waktu_catat")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5">
                                <SiteBadge siteId={log.site_id} />
                            </td>
                            <td className="px-4 py-2.5">
                                <p className="font-semibold text-foreground">{log.machine?.name ?? log.machine_code}</p>
                                <p className="text-[10px] text-muted-foreground">{log.machine_code}</p>
                            </td>
                            <td className="px-4 py-2.5">
                                <p className="font-medium text-foreground">{log.work_order ?? "â€”"}</p>
                                <p className="text-[10px] text-muted-foreground">{log.part_number ?? ""}</p>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                                {log.shift ? <Badge variant="outline" className="text-[10px]">Shift {log.shift}</Badge> : "â€”"}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                                {log.oee_percentage != null ? (
                                    <span className={`font-bold ${
                                        log.oee_percentage >= 85 ? "text-success" :
                                        log.oee_percentage >= 60 ? "text-warning" : "text-destructive"
                                    }`}>
                                        {parseFloat(log.oee_percentage).toFixed(1)}%
                                    </span>
                                ) : "â€”"}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-success">{log.good_quantity ?? 0}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-destructive">{log.defect_quantity ?? 0}</td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground">{log.downtime_min != null ? parseFloat(log.downtime_min).toFixed(1) : "â€”"}</td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                                {log.recorded_at ? new Date(log.recorded_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "â€”"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AlarmLogTable({ logs, loading }: { logs: any[]; loading: boolean }) {
    const t = useTranslations("EdgeLogsView");
    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
    if (!logs.length) return (
        <div className="flex flex-col items-center py-10 gap-2">
            <Database className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t("belum_ada_log_alarm_edge")}</p>
        </div>
    );
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left px-4 py-2.5 font-semibold">{t("site_1")}</th>
                        <th className="text-left px-4 py-2.5 font-semibold">{t("mesin_1")}</th>
                        <th className="text-left px-4 py-2.5 font-semibold">{t("kode_alarm")}</th>
                        <th className="text-left px-4 py-2.5 font-semibold">{t("pesan")}</th>
                        <th className="text-center px-4 py-2.5 font-semibold">{t("tingkat")}</th>
                        <th className="text-right px-4 py-2.5 font-semibold">{t("terjadi")}</th>
                        <th className="text-right px-4 py-2.5 font-semibold">{t("diselesaikan")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5">
                                <SiteBadge siteId={log.site_id} />
                            </td>
                            <td className="px-4 py-2.5">
                                <p className="font-semibold text-foreground">{log.machine?.name ?? log.machine_code}</p>
                                <p className="text-[10px] text-muted-foreground">{log.machine_code}</p>
                            </td>
                            <td className="px-4 py-2.5">
                                <Badge variant="outline" className="font-mono text-[10px]">{log.alarm_code ?? "â€”"}</Badge>
                            </td>
                            <td className="px-4 py-2.5 max-w-[240px]">
                                <p className="font-medium text-foreground truncate">{log.message}</p>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                                <SeverityBadge severity={log.severity} />
                            </td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                                {log.occurred_at ? new Date(log.occurred_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "â€”"}
                            </td>
                            <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                {log.resolved_at ? (
                                    <span className="text-success font-medium">
                                        {new Date(log.resolved_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                                    </span>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{t("aktif")}</Badge>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

type Tab = "production" | "alarm";

export function EdgeLogsView() {
    const t = useTranslations("EdgeLogsView");
    const [tab, setTab] = useState<Tab>("production");
    const [siteId, setSiteId] = useState<string>("");
    const [sites, setSites] = useState<{ site_id: string; name: string }[]>([]);
    const [prodLogs, setProdLogs] = useState<any[]>([]);
    const [alarmLogs, setAlarmLogs] = useState<any[]>([]);
    const [prodPage, setProdPage] = useState(1);
    const [alarmPage, setAlarmPage] = useState(1);
    const [prodTotal, setProdTotal] = useState(0);
    const [alarmTotal, setAlarmTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [severityFilter, setSeverityFilter] = useState("");

    // Load site list for filter
    useEffect(() => {
        manufacturingService.getEdgeSites()
            .then(res => {
                const s = res.data?.data?.sites ?? [];
                setSites(s.map((x: any) => ({ site_id: x.site_id, name: x.name })));
            })
            .catch(() => {});
    }, []);

    const loadProd = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { page, per_page: 15 };
            if (siteId) params.site_id = siteId;
            const res = await manufacturingService.getEdgeProductionLogs(params);
            const d = res.data?.data;
            setProdLogs(Array.isArray(d) ? d : (d?.data ?? []));
            setProdTotal(d?.total ?? 0);
            setProdPage(page);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [siteId]);

    const loadAlarms = useCallback(async (page = 1, severity = "") => {
        setLoading(true);
        try {
            const params: any = { page, per_page: 15, severity: severity || undefined };
            if (siteId) params.site_id = siteId;
            const res = await manufacturingService.getEdgeAlarmLogs(params);
            const d = res.data?.data;
            setAlarmLogs(Array.isArray(d) ? d : (d?.data ?? []));
            setAlarmTotal(d?.total ?? 0);
            setAlarmPage(page);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [siteId]);

    useEffect(() => { loadProd(); }, [loadProd]);
    useEffect(() => { loadAlarms(1, severityFilter); }, [loadAlarms, severityFilter]);

    const prodPages = Math.ceil(prodTotal / 15);
    const alarmPages = Math.ceil(alarmTotal / 15);

    return (
        <DashboardPageShell
            title={t("title_edge_logs")}
            subtitle={t("title_log_raw_produksi_dan_alarm_yang_dikirim")}
            icon={Database}
            actions={
                <div className="flex items-center gap-2">
                    {/* Site filter */}
                    {sites.length > 0 && (
                        <select
                            value={siteId}
                            onChange={e => setSiteId(e.target.value)}
                            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="">{t("semua_sites")}</option>
                            {sites.map(s => (
                                <option key={s.site_id} value={s.site_id}>{s.name} ({s.site_id})</option>
                            ))}
                        </select>
                    )}
                    <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl"
                        onClick={() => tab === "production" ? loadProd(prodPage) : loadAlarms(alarmPage, severityFilter)}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1 w-fit border border-border/40">
                    {([
                        { key: "production", label: "Log Produksi", icon: Activity, count: prodTotal },
                        { key: "alarm", label: "Log Alarm", icon: BellDot, count: alarmTotal },
                    ] as const).map(({ key, label, icon: Icon, count }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                tab === key
                                    ? "bg-background text-foreground shadow-sm border border-border/50"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                            {count > 0 && (
                                <Badge variant={tab === key ? "default" : "secondary"} className="text-[9px] h-4 px-1.5">
                                    {count.toLocaleString()}
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>

                {/* Alarm severity filter */}
                {tab === "alarm" && (
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-muted-foreground" />
                        <div className="flex gap-1">
                            {["", "critical", "warning", "info"].map(sev => (
                                <button
                                    key={sev}
                                    onClick={() => setSeverityFilter(sev)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                                        severityFilter === sev
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {sev === "" ? "Semua" : sev === "critical" ? "Kritis" : sev === "warning" ? "Peringatan" : "Info"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table */}
                <SectionCard
                    title={tab === "production" ? "Log Produksi Edge" : "Log Alarm Edge"}
                    icon={tab === "production" ? Activity : BellDot}
                    noPadding
                >
                    {tab === "production" ? (
                        <ProdLogTable logs={prodLogs} loading={loading} />
                    ) : (
                        <AlarmLogTable logs={alarmLogs} loading={loading} />
                    )}

                    {/* Pagination */}
                    {(tab === "production" ? prodPages : alarmPages) > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                            <p className="text-xs text-muted-foreground">
                                Halaman {tab === "production" ? prodPage : alarmPage} dari {tab === "production" ? prodPages : alarmPages}
                            </p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={tab === "production" ? prodPage <= 1 : alarmPage <= 1}
                                    onClick={() => tab === "production" ? loadProd(prodPage - 1) : loadAlarms(alarmPage - 1, severityFilter)}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronLeft size={12} />
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={tab === "production" ? prodPage >= prodPages : alarmPage >= alarmPages}
                                    onClick={() => tab === "production" ? loadProd(prodPage + 1) : loadAlarms(alarmPage + 1, severityFilter)}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronRight size={12} />
                                </Button>
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>
        </DashboardPageShell>
    );
}

