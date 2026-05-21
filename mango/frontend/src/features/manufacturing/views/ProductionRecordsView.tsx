"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Plus, Loader2, X, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
    AdminDataCard, AdminToolbar, AdminSearchField, AdminSelectFilter,
    AdminState, AdminPagination, AdminDialog, AdminIconButton,
} from "@/src/components/ui/dashboard/AdminDataView";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { format } from "date-fns";
import { manufacturingService } from "@/src/features/manufacturing/services/manufacturingService";

interface ProductionRecord {
    id: number;
    shift?: number;
    good_quantity: number;
    reject_quantity: number;
    reject_reason?: string;
    cycle_time_actual?: number;
    operating_time_min?: number;
    downtime_min?: number;
    recorded_at: string;
    source: string;
    work_order?: { id: number; code: string; title: string };
    machine?: { id: number; name: string; code: string };
    operator?: { id: number; name: string };
}

export function ProductionRecordsView() {
    const t = useTranslations("ManufacturingPage");

    const [records, setRecords] = useState<ProductionRecord[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("");
    const [machineFilter, setMachineFilter] = useState("");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        work_order_id: "", machine_id: "", shift: "",
        good_quantity: 0, reject_quantity: 0, reject_reason: "",
        cycle_time_actual: "", operating_time_min: "", downtime_min: "",
        recorded_at: new Date().toISOString().slice(0, 16),
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await manufacturingService.getProductionRecords({
                date: dateFilter || undefined,
                machine_id: machineFilter || undefined,
                page,
                per_page: 20,
            });
            const d = res.data?.data;
            setRecords(d?.data ?? []);
            setPagination(d ?? null);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [dateFilter, machineFilter, page]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        manufacturingService.getMachines().then((r) => setMachines(r.data?.data ?? [])).catch(() => {});
        manufacturingService.getWorkOrders({ per_page: 100 }).then((r) => setWorkOrders(r.data?.data?.data ?? [])).catch(() => {});
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            await manufacturingService.createProductionRecord({
                work_order_id: form.work_order_id ? Number(form.work_order_id) : null,
                machine_id: form.machine_id ? Number(form.machine_id) : null,
                shift: form.shift ? Number(form.shift) : null,
                good_quantity: Number(form.good_quantity),
                reject_quantity: Number(form.reject_quantity),
                reject_reason: form.reject_reason || null,
                cycle_time_actual: form.cycle_time_actual ? Number(form.cycle_time_actual) : null,
                operating_time_min: form.operating_time_min ? Number(form.operating_time_min) : null,
                downtime_min: form.downtime_min ? Number(form.downtime_min) : null,
                recorded_at: form.recorded_at || null,
            });
            toast.success(t("success_production_logged"));
            setShowModal(false);
            load();
        } catch (e: any) {
            toast.error(manufacturingService.parseErrors(e));
        }
        finally { setSaving(false); }
    }

    async function handleUndo(id: number) {
        if (!confirm(t("confirm_undo_production"))) return;
        try {
            await manufacturingService.destroyProductionRecord(id);
            toast.success(t("success_production_undone"));
            load();
        } catch (e: any) {
            toast.error(manufacturingService.parseErrors(e));
        }
    }

    const machineOptions = [
        { value: "", label: t("filter_all_machines") },
        ...machines.map((m: any) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
    ];

    const pageNumbers = pagination
        ? Array.from({ length: Math.min(pagination.last_page ?? 1, 7) }, (_, i) => i + 1)
        : [];

    function fmtDate(iso: string) {
        return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    return (
        <DashboardPageShell
            title={t("production_title")}
            subtitle={t("production_subtitle")}
            icon={ClipboardList}
            actions={
                <Button className="gap-2 h-10 rounded-xl" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> {t("add_production")}
                </Button>
            }
        >
            <AdminDataCard
                toolbar={
                    <AdminToolbar>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">{t("date_label")}</label>
                            <DateTimePicker
                                className="w-48"
                                value={dateFilter ? new Date(dateFilter) : null}
                                onChange={(d) => { setDateFilter(d ? format(d, 'yyyy-MM-dd') : ""); setPage(1); }}
                            />
                        </div>
                        <AdminSelectFilter
                            label={t("prod_machine")}
                            value={machineFilter}
                            options={machineOptions}
                            onChange={(v) => { setMachineFilter(v); setPage(1); }}
                        />
                    </AdminToolbar>
                }
            >
                {loading ? (
                    <AdminState icon={Loader2} title={t("loading")} loading />
                ) : records.length === 0 ? (
                    <AdminState icon={ClipboardList} title={t("empty_production")} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("prod_recorded")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("prod_work_order")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("prod_machine")}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground">{t("prod_shift")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("prod_good")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("prod_reject")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("prod_cycle")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("prod_downtime")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("prod_source")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {records.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(rec.recorded_at)}</td>
                                        <td className="px-5 py-3">
                                            {rec.work_order ? (
                                                <div>
                                                    <p className="text-xs font-mono font-bold text-foreground">{rec.work_order.code}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{rec.work_order.title}</p>
                                                </div>
                                            ) : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-muted-foreground">{rec.machine?.name ?? "—"}</td>
                                        <td className="px-5 py-3 text-center">
                                            {rec.shift ? <Badge variant="outline" className="text-[10px]">Shift {rec.shift}</Badge> : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-bold text-success">{rec.good_quantity}</td>
                                        <td className="px-5 py-3 text-right text-sm font-bold text-destructive">{rec.reject_quantity}</td>
                                        <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                                            {rec.cycle_time_actual ? `${rec.cycle_time_actual}s` : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                                            {rec.downtime_min ? `${rec.downtime_min}m` : "—"}
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge
                                                variant={rec.source === "edge" ? "outline" : "secondary"}
                                                className="text-[10px] font-bold"
                                            >
                                                {rec.source}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" title={t("undo_title")} onClick={() => handleUndo(rec.id)}>
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </Button>
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

            {/* Log Production Modal */}
            {showModal && (
                <AdminDialog>
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-base font-semibold">{t("create_production_title")}</h2>
                        <AdminIconButton onClick={() => setShowModal(false)}><X className="h-4 w-4" /></AdminIconButton>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_work_order")}</label>
                                <select className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.work_order_id} onChange={(e) => setForm(f => ({ ...f, work_order_id: e.target.value }))}>
                                    <option value="">{t("none")}</option>
                                    {workOrders.map((wo: any) => <option key={wo.id} value={wo.id}>{wo.code} — {wo.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_machine")}</label>
                                <select className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.machine_id} onChange={(e) => setForm(f => ({ ...f, machine_id: e.target.value }))}>
                                    <option value="">{t("none")}</option>
                                    {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_shift")}</label>
                                <select className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.shift} onChange={(e) => setForm(f => ({ ...f, shift: e.target.value }))}>
                                    <option value="">—</option>
                                    <option value="1">{t("shift_1")}</option>
                                    <option value="2">{t("shift_2")}</option>
                                    <option value="3">{t("shift_3")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_good")} *</label>
                                <input type="number" min={0} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.good_quantity} onChange={(e) => setForm(f => ({ ...f, good_quantity: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_reject")}</label>
                                <input type="number" min={0} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.reject_quantity} onChange={(e) => setForm(f => ({ ...f, reject_quantity: Number(e.target.value) }))} />
                            </div>
                        </div>
                        {form.reject_quantity > 0 && (
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("reject_reason_label")}</label>
                                <select className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.reject_reason} onChange={(e) => setForm(f => ({ ...f, reject_reason: e.target.value }))}>
                                    <option value="">{t("select_reason")}</option>
                                    <option value="Kesalahan Operator">{t("reason_operator_error")}</option>
                                    <option value="Mesin Error">{t("reason_machine_error")}</option>
                                    <option value="Material Cacat">{t("reason_material_defect")}</option>
                                    <option value="Lainnya">{t("reason_other")}</option>
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_cycle")}</label>
                                <input type="number" min={0} step="0.1" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.cycle_time_actual} onChange={(e) => setForm(f => ({ ...f, cycle_time_actual: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("operating_time_label")}</label>
                                <input type="number" min={0} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.operating_time_min} onChange={(e) => setForm(f => ({ ...f, operating_time_min: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("prod_downtime")}</label>
                                <input type="number" min={0} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.downtime_min} onChange={(e) => setForm(f => ({ ...f, downtime_min: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">{t("prod_recorded")}</label>
                            <DateTimePicker
                                includeTime
                                value={form.recorded_at ? new Date(form.recorded_at) : null}
                                onChange={(d) => setForm(f => ({ ...f, recorded_at: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" }))}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowModal(false)}>{t("cancel")}</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? t("saving") : t("save")}
                        </Button>
                    </div>
                </AdminDialog>
            )}
        </DashboardPageShell>
    );
}
