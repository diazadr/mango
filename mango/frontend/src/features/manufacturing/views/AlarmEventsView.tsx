"use client";

import { useEffect, useState, useCallback } from "react";
import { BellDot, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
    AdminDataCard, AdminToolbar, AdminSelectFilter,
    AdminState, AdminPagination, AdminIconButton,
} from "@/src/components/ui/dashboard/AdminDataView";
import { manufacturingService } from "@/src/features/manufacturing/services/manufacturingService";

const SEVERITY_STYLES: Record<string, string> = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
};

const SEVERITY_DOT: Record<string, string> = {
    critical: "bg-destructive",
    warning: "bg-warning",
    info: "bg-primary",
};

interface AlarmEvent {
    id: number;
    code: string;
    message: string;
    severity: string;
    status: string;
    occurred_at: string;
    resolved_at?: string;
    machine?: { id: number; name: string; code: string };
    work_order?: { id: number; code: string };
}

export function AlarmEventsView() {
    const t = useTranslations("ManufacturingPage");

    const [alarms, setAlarms] = useState<AlarmEvent[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");
    const [machineFilter, setMachineFilter] = useState("");
    const [page, setPage] = useState(1);
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await manufacturingService.getAlarmEvents({
                status: statusFilter || undefined,
                severity: severityFilter || undefined,
                machine_id: machineFilter || undefined,
                page,
                per_page: 20,
            });
            const d = res.data?.data;
            setAlarms(Array.isArray(d) ? d : (d?.data ?? []));
            setPagination(d ?? null);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [statusFilter, severityFilter, machineFilter, page]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        manufacturingService.getMachines().then((r) => setMachines(r.data?.data ?? [])).catch(() => {});
    }, []);

    async function handleResolve(id: number) {
        setResolvingId(id);
        try {
            await manufacturingService.resolveAlarm(id);
            load();
        } catch { /* silent */ }
        finally { setResolvingId(null); }
    }

    function fmtDate(iso?: string) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    const statusOptions = [
        { value: "", label: t("filter_all_status") },
        { value: "open", label: t("status_open") },
        { value: "resolved", label: t("status_resolved") },
    ];
    const severityOptions = [
        { value: "", label: t("filter_all_severity") },
        { value: "critical", label: t("severity_critical") },
        { value: "warning", label: t("severity_warning") },
        { value: "info", label: t("severity_info") },
    ];
    const machineOptions = [
        { value: "", label: t("filter_all_machines") },
        ...machines.map((m: any) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
    ];
    const pageNumbers = pagination
        ? Array.from({ length: Math.min(pagination.last_page ?? 1, 7) }, (_, i) => i + 1)
        : [];

    return (
        <DashboardPageShell
            title={t("alarm_title")}
            subtitle={t("alarm_subtitle")}
            icon={BellDot}
        >
            <AdminDataCard
                toolbar={
                    <AdminToolbar>
                        <AdminSelectFilter
                            label={t("alarm_status")}
                            value={statusFilter}
                            options={statusOptions}
                            onChange={(v) => { setStatusFilter(v); setPage(1); }}
                        />
                        <AdminSelectFilter
                            label={t("alarm_severity")}
                            value={severityFilter}
                            options={severityOptions}
                            onChange={(v) => { setSeverityFilter(v); setPage(1); }}
                        />
                        <AdminSelectFilter
                            label={t("alarm_machine")}
                            value={machineFilter}
                            options={machineOptions}
                            onChange={(v) => { setMachineFilter(v); setPage(1); }}
                        />
                    </AdminToolbar>
                }
            >
                {loading ? (
                    <AdminState icon={Loader2} title={t("loading")} loading />
                ) : alarms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-success" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{t("empty_alarms")}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground w-8"></th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("alarm_occurred")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("alarm_machine")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("alarm_code")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("alarm_message")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("alarm_severity")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("alarm_status")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("alarm_resolved")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {alarms.map((alarm) => (
                                    <tr
                                        key={alarm.id}
                                        className={`hover:bg-muted/20 transition-colors ${alarm.status === "open" && alarm.severity === "critical" ? "bg-destructive/[0.02]" : ""}`}
                                    >
                                        <td className="px-5 py-3">
                                            <span className={`inline-block h-2 w-2 rounded-full ${alarm.status === "open" ? (SEVERITY_DOT[alarm.severity] ?? "bg-muted-foreground") : "bg-muted-foreground/30"}`} />
                                        </td>
                                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(alarm.occurred_at)}</td>
                                        <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">{alarm.machine?.name ?? "—"}</td>
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs font-bold text-foreground">{alarm.code}</span>
                                        </td>
                                        <td className="px-5 py-3 max-w-[250px]">
                                            <p className="text-sm text-foreground truncate" title={alarm.message}>{alarm.message}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[alarm.severity] ?? "bg-muted text-muted-foreground"}`}>
                                                {t(`severity_${alarm.severity}`)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge variant={alarm.status === "open" ? "destructive" : "secondary"} className="text-[10px] font-bold">
                                                {t(`status_${alarm.status}`)}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(alarm.resolved_at)}</td>
                                        <td className="px-5 py-3 text-right">
                                            {alarm.status === "open" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs gap-1 border-success/30 text-success hover:bg-success/10 hover:text-success"
                                                    disabled={resolvingId === alarm.id}
                                                    onClick={() => handleResolve(alarm.id)}
                                                >
                                                    {resolvingId === alarm.id ? (
                                                        <><Loader2 className="h-3 w-3 animate-spin" /> {t("alarm_resolving")}</>
                                                    ) : (
                                                        <><CheckCircle2 className="h-3 w-3" /> {t("alarm_resolve")}</>
                                                    )}
                                                </Button>
                                            )}
                                            {alarm.status === "resolved" && (
                                                <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {pagination && (
                    <AdminPagination
                        currentPage={pagination.current_page ?? 1}
                        totalPages={pagination.last_page ?? 1}
                        pageNumbers={pageNumbers}
                        onPageChange={setPage}
                    />
                )}
            </AdminDataCard>
        </DashboardPageShell>
    );
}
