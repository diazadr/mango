"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardSignature, Plus, Pencil, Loader2, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
    AdminDataCard, AdminToolbar, AdminSearchField, AdminSelectFilter,
    AdminState, AdminPagination, AdminDialog, AdminIconButton,
} from "@/src/components/ui/dashboard/AdminDataView";
import { manufacturingService } from "@/src/features/manufacturing/services/manufacturingService";
import { WorkOrdersKanbanView } from "./WorkOrdersKanbanView";
import { LayoutGrid, List } from "lucide-react";
import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { format } from "date-fns";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
    draft: { label: "Draft", class: "bg-muted text-muted-foreground" },
    released: { label: "Released", class: "bg-primary/10 text-primary" },
    in_progress: { label: "In Progress", class: "bg-warning/10 text-warning" },
    completed: { label: "Completed", class: "bg-success/10 text-success" },
    cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive" },
};

const PRIORITY_MAP: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    normal: "bg-primary/10 text-primary",
    high: "bg-warning/10 text-warning",
    urgent: "bg-destructive/10 text-destructive",
};

// ─── WO Step-bar ─────────────────────────────────────────────────────────────
const WO_STEPS = [
    { key: "draft",       label: "Draft" },
    { key: "released",    label: "Released" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed",   label: "Done" },
];

function WoStepBar({ status }: { status: string }) {
    if (status === "cancelled") {
        return (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                Cancelled
            </span>
        );
    }
    const activeIdx = WO_STEPS.findIndex(s => s.key === status);
    return (
        <div className="flex items-center gap-0.5 min-w-[160px]">
            {WO_STEPS.map((step, i) => {
                const isDone    = i < activeIdx;
                const isActive  = i === activeIdx;
                const isPending = i > activeIdx;
                return (
                    <div key={step.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-0.5 w-full">
                            <div
                                className={`h-1.5 w-full rounded-full transition-all ${
                                    isDone   ? "bg-success" :
                                    isActive ? "bg-primary animate-pulse" :
                                    "bg-muted/60"
                                }`}
                            />
                            {isActive && (
                                <span className="text-[8px] font-black text-primary tracking-wide whitespace-nowrap">
                                    {step.label}
                                </span>
                            )}
                        </div>
                        {i < WO_STEPS.length - 1 && (
                            <div className={`w-1 h-px ${ isDone ? "bg-success" : "bg-muted/40" }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

interface WorkOrder {
    id: number;
    code: string;
    title: string;
    part_number?: string;
    machine?: { id: number; name: string; code: string };
    target_quantity: number;
    completed_quantity: number;
    reject_quantity: number;
    priority: string;
    status: string;
    shift?: number;
    source: string;
    planned_start_at?: string;
    planned_end_at?: string;
    notes?: string;
}

const EMPTY_FORM = {
    code: "", title: "", part_number: "", machine_id: "",
    target_quantity: 1, priority: "normal", status: "draft",
    shift: "", planned_start_at: "", planned_end_at: "", notes: "",
};

export function WorkOrdersView() {
    const t = useTranslations("ManufacturingPage");

    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<WorkOrder | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    // Load work orders
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await manufacturingService.getWorkOrders({
                search: search || undefined,
                status: statusFilter || undefined,
                page,
                per_page: 15,
            });
            const d = res.data?.data;
            setOrders(Array.isArray(d) ? d : (d?.data ?? []));
            setPagination(d ?? null);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    // Load machines for dropdown
    useEffect(() => {
        (async () => {
            try {
                const res = await manufacturingService.getMachines();
                // MachineController returns paginated: { data: { data: [...] } }
                const raw = res.data?.data;
                setMachines(Array.isArray(raw) ? raw : (raw?.data ?? []));
            } catch {
                // silent
            }
        })();
    }, []);

    function openCreate() {
        setEditItem(null);
        
        // Auto-generate code
        const d = new Date();
        const dateStr = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
        const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const generatedCode = `WO-${dateStr}-${randomStr}`;

        setForm({ ...EMPTY_FORM, code: generatedCode });
        setSaveError(null);
        setShowModal(true);
    }

    function toLocalDate(isoStr?: string) {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return "";
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function openEdit(wo: WorkOrder) {
        setEditItem(wo);
        setSaveError(null);
        setForm({
            code: wo.code,
            title: wo.title,
            part_number: wo.part_number ?? "",
            machine_id: wo.machine?.id?.toString() ?? "",
            target_quantity: wo.target_quantity,
            priority: wo.priority,
            status: wo.status,
            shift: wo.shift?.toString() ?? "",
            planned_start_at: toLocalDate(wo.planned_start_at),
            planned_end_at: toLocalDate(wo.planned_end_at),
            notes: wo.notes ?? "",
        });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.code.trim() || !form.title.trim()) {
            setSaveError(t("error_wo_required"));
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const payload = {
                ...form,
                machine_id: form.machine_id ? Number(form.machine_id) : null,
                target_quantity: Number(form.target_quantity),
                shift: form.shift ? Number(form.shift) : null,
                planned_start_at: form.planned_start_at || null,
                planned_end_at: form.planned_end_at || null,
                part_number: form.part_number || null,
                notes: form.notes || null,
            };
            if (editItem) {
                await manufacturingService.updateWorkOrder(editItem.id, payload);
            } else {
                await manufacturingService.createWorkOrder(payload as any);
            }
            setShowModal(false);
            load();
        } catch (err: any) {
            setSaveError(manufacturingService.parseErrors(err));
        } finally {
            setSaving(false);
        }
    }

    const statusOptions = [
        { value: "", label: t("filter_all_status") },
        { value: "draft", label: t("status_draft") },
        { value: "released", label: t("status_released") },
        { value: "in_progress", label: t("status_in_progress") },
        { value: "completed", label: t("status_completed") },
        { value: "cancelled", label: t("status_cancelled") },
    ];

    const pageNumbers = pagination
        ? Array.from({ length: Math.min(pagination.last_page ?? 1, 7) }, (_, i) => i + 1)
        : [];

    return (
        <DashboardPageShell
            title={t("work_orders_title")}
            subtitle={t("work_orders_subtitle")}
            actions={
                <Button className="gap-2 h-10 rounded-xl" onClick={openCreate}>
                    <Plus size={16} /> {t("add_work_order")}
                </Button>
            }
        >
            <AdminDataCard
                toolbar={
                    <AdminToolbar>
                        <AdminSearchField
                            placeholder={t("search_placeholder")}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <AdminSelectFilter
                            label={t("status")}
                            value={statusFilter}
                            options={statusOptions}
                            onChange={(v) => { setStatusFilter(v); setPage(1); }}
                        />
                        <div className="flex bg-muted p-1 rounded-lg ml-auto">
                            <button
                                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setViewMode('table')}
                            >
                                <List className="w-3.5 h-3.5" /> {t("tab_table")}
                            </button>
                            <button
                                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'kanban' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setViewMode('kanban')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" /> {t("tab_kanban")}
                            </button>
                        </div>
                    </AdminToolbar>
                }
            >
                {viewMode === "kanban" ? (
                    <WorkOrdersKanbanView search={search} machineFilter="" />
                ) : loading ? (
                    <AdminState icon={Loader2} title={t("loading")} loading />
                ) : orders.length === 0 ? (
                    <AdminState icon={ClipboardSignature} title={t("empty_work_orders")} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("wo_code")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("wo_title")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("wo_machine")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("target")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("done")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("reject")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("wo_priority")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("wo_status")}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">{t("wo_source")}</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {orders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs font-bold text-foreground whitespace-nowrap">{wo.code}</td>
                                        <td className="px-5 py-3 max-w-[200px]">
                                            <p className="text-sm font-medium text-foreground truncate">{wo.title}</p>
                                            {wo.part_number && <p className="text-[10px] text-muted-foreground tracking-wide">{wo.part_number}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">{wo.machine?.name ?? "—"}</td>
                                        <td className="px-5 py-3 text-right text-sm font-semibold">{wo.target_quantity}</td>
                                        <td className="px-5 py-3 text-right text-sm text-success font-semibold">{wo.completed_quantity}</td>
                                        <td className="px-5 py-3 text-right text-sm text-destructive font-semibold">{wo.reject_quantity}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_MAP[wo.priority] ?? "bg-muted"}`}>
                                                {wo.priority}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <WoStepBar status={wo.status} />
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge variant={wo.source === "edge" ? "outline" : "secondary"} className="text-[10px] font-bold">
                                                {wo.source}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <AdminIconButton tone="primary" title={t("title_edit")} onClick={() => openEdit(wo)}>
                                                <Pencil className="h-4 w-4" />
                                            </AdminIconButton>
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

            {/* Create / Edit Modal */}
            {showModal && (
                <AdminDialog>
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h2 className="text-base font-semibold">
                            {editItem ? t("edit_work_order") : t("create_title")}
                        </h2>
                        <AdminIconButton onClick={() => setShowModal(false)}>
                            <X className="h-4 w-4" />
                        </AdminIconButton>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Error Banner */}
                        {saveError && (
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{saveError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_code")} *</label>
                                <input
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.code}
                                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                                    disabled={!!editItem}
                                    placeholder={t("placeholder_wo2024001")}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_part")}</label>
                                <input
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.part_number}
                                    onChange={(e) => setForm(f => ({ ...f, part_number: e.target.value }))}
                                    placeholder={t("placeholder_nomor_part")}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">{t("wo_title")} *</label>
                            <input
                                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder={t("placeholder_judul_work_order")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    {t("wo_machine")}
                                    {machines.length === 0 && (
                                        <span className="ml-2 text-warning text-[10px]">({t("no_machines_warning")})</span>
                                    )}
                                </label>
                                <select
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.machine_id}
                                    onChange={(e) => setForm(f => ({ ...f, machine_id: e.target.value }))}
                                >
                                    <option value="">— {t("without_machine")} —</option>
                                    {machines.map((m: any) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("target_qty")} *</label>
                                <input
                                    type="number" min={0}
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.target_quantity}
                                    onChange={(e) => setForm(f => ({ ...f, target_quantity: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_priority")}</label>
                                <select
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.priority}
                                    onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
                                >
                                    <option value="low">{t("priority_low")}</option>
                                    <option value="normal">{t("priority_normal")}</option>
                                    <option value="high">{t("priority_high")}</option>
                                    <option value="urgent">{t("priority_urgent")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_status")}</label>
                                <select
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.status}
                                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="draft">{t("status_draft")}</option>
                                    <option value="released">{t("status_released")}</option>
                                    <option value="in_progress">{t("status_in_progress")}</option>
                                    <option value="completed">{t("status_completed")}</option>
                                    <option value="cancelled">{t("status_cancelled")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_shift")}</label>
                                <select
                                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={form.shift}
                                    onChange={(e) => setForm(f => ({ ...f, shift: e.target.value }))}
                                >
                                    <option value="">—</option>
                                    <option value="1">{t("shift_1")}</option>
                                    <option value="2">{t("shift_2")}</option>
                                    <option value="3">{t("shift_3")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_planned_start")}</label>
                                <DateTimePicker
                                    className="mt-1"
                                    value={form.planned_start_at ? new Date(form.planned_start_at) : null}
                                    onChange={(d) => setForm(f => ({ ...f, planned_start_at: d ? format(d, 'yyyy-MM-dd') : "" }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">{t("wo_planned_end")}</label>
                                <DateTimePicker
                                    className="mt-1"
                                    value={form.planned_end_at ? new Date(form.planned_end_at) : null}
                                    onChange={(d) => setForm(f => ({ ...f, planned_end_at: d ? format(d, 'yyyy-MM-dd') : "" }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">{t("wo_notes")}</label>
                            <textarea
                                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                rows={3}
                                value={form.notes}
                                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-border flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[100px]">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? t("saving") : t("save")}
                        </Button>
                    </div>
                </AdminDialog>
            )}
        </DashboardPageShell>
    );
}
