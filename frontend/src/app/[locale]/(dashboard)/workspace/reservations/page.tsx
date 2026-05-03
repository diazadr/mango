"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import {
    Loader2,
    Wrench,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    MapPin,
    Save,
    Tag,
    X,
    CircleDollarSign,
    Info,
    Download,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcDurationHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
    return Math.max(0, diff);
}

function formatDT(dtStr: string) {
    if (!dtStr) return "-";
    const d = new Date(dtStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
        + " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ─── Visual 7-day timeline schedule ──────────────────────────────────────────
const HOUR_START = 6;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_MARKS = [6, 9, 12, 15, 18, 21];

function pct(h: number) { return ((h - HOUR_START) / TOTAL_HOURS) * 100; }
function clamp(v: number, min = 0, max = 100) { return Math.min(max, Math.max(min, v)); }

function MachineTimeline({ schedule, selStart, selEnd }: {
    schedule: any[];
    selStart: string;
    selEnd: string;
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
    });

    const slotsForDay = (day: Date) =>
        schedule.filter(s => {
            const sStart = new Date(s.start_time).getTime();
            const sEnd   = new Date(s.end_time).getTime();
            const dStart = day.getTime();
            const dEnd   = dStart + 86400000;
            return sStart < dEnd && sEnd > dStart;
        });

    const selBlock = (day: Date) => {
        if (!selStart || !selEnd) return null;
        const sS = new Date(selStart);
        const sE = new Date(selEnd);
        const dS = day.getTime();
        const dE = dS + 86400000;
        if (sS.getTime() >= dE || sE.getTime() <= dS) return null;
        const sh = sS.getHours() + sS.getMinutes() / 60;
        const eh = sE.getHours() + sE.getMinutes() / 60;
        return { left: clamp(pct(sh)), width: clamp(pct(eh) - pct(sh), 0, 100 - clamp(pct(sh))) };
    };

    const dayLabel = (d: Date) => d.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" });
    const isToday  = (d: Date) => d.toDateString() === new Date().toDateString();

    return (
        <div className="space-y-1">
            {/* Hour axis */}
            <div className="flex ml-20 pr-1">
                {HOUR_MARKS.map(h => (
                    <div key={h} className="flex-1 text-[9px] font-bold text-muted-foreground/60 text-center">{h < 10 ? `0${h}` : h}:00</div>
                ))}
            </div>
            {days.map((day, di) => {
                const slots = slotsForDay(day);
                const sel   = selBlock(day);
                return (
                    <div key={di} className="flex items-center gap-2">
                        <div className={`w-20 text-[10px] font-bold shrink-0 leading-tight ${
                            isToday(day) ? "text-primary" : "text-muted-foreground"
                        }`}>
                            {dayLabel(day)}
                        </div>
                        <div className="relative flex-1 h-7 bg-muted/30 rounded-lg overflow-hidden">
                            {/* Hour gridlines */}
                            {HOUR_MARKS.map(h => (
                                <div key={h} className="absolute top-0 h-full border-l border-border/40"
                                    style={{ left: `${pct(h)}%` }} />
                            ))}
                            {/* Reserved blocks */}
                            {slots.map((s, si) => {
                                const sh = new Date(s.start_time).getHours() + new Date(s.start_time).getMinutes() / 60;
                                const eh = new Date(s.end_time).getHours() + new Date(s.end_time).getMinutes() / 60;
                                const l = clamp(pct(sh));
                                const w = clamp(pct(eh) - l, 0, 100 - l);
                                return (
                                    <div key={si}
                                        title={`${new Date(s.start_time).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} – ${new Date(s.end_time).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} (${s.status})`}
                                        className="absolute top-1 bottom-1 rounded bg-destructive/60 border border-destructive/30 cursor-help"
                                        style={{ left: `${l}%`, width: `${w}%` }}
                                    />
                                );
                            })}
                            {/* User selection */}
                            {sel && (
                                <div className="absolute top-1 bottom-1 rounded bg-primary/50 border border-primary"
                                    style={{ left: `${sel.left}%`, width: `${sel.width}%` }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
            <div className="flex items-center gap-4 mt-2 ml-20">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-5 rounded bg-destructive/60 border border-destructive/30" />
                    <span className="text-[10px] font-bold text-muted-foreground">Terpakai</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-5 rounded bg-primary/50 border border-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground">Pilihan Anda</span>
                </div>
            </div>
        </div>
    );
}

function formatRp(n: number) {
    return "Rp " + n.toLocaleString("id-ID");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MachineReservationPage() {
    const [machines, setMachines] = useState<any[]>([]);
    const [myReservations, setMyReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userContext, setUserContext] = useState<any>(null);

    const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<any>(null);
    const [machineSchedule, setMachineSchedule] = useState<any[]>([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    const [form, setForm] = useState({
        start_time: "",
        end_time: "",
        purpose: ""
    });

    // ── Fetch initial data ──────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [userRes, machRes, resRes] = await Promise.all([
                api.get("/v1/me"),
                api.get("/v1/machines"),
                api.get("/v1/machines/reservations/all")
            ]);
            const userData = userRes.data.data?.user || userRes.data.user;
            setUserContext(userData);

            const ownerType = userData.roles?.includes('upt')
                ? 'App\\Models\\Master\\Organization'
                : 'App\\Models\\Umkm\\Umkm';
            const ownerId = userData.roles?.includes('upt')
                ? userData.organizations?.[0]?.id
                : userData.umkm?.id;

            const processedMachines = machRes.data.data?.map((m: any) => ({
                ...m,
                is_mine: m.owner_type === ownerType && m.owner_id === ownerId
            })) || [];

            setMachines(processedMachines);
            setMyReservations(resRes.data.data || []);
        } catch (err) {
            console.error("Gagal mengambil data reservasi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Open dialog: fetch machine schedule ────────────────────────────────
    const openReserveDialog = async (machine: any) => {
        setSelectedMachine(machine);
        setForm({ start_time: "", end_time: "", purpose: "" });
        setMachineSchedule([]);
        setReservationDialogOpen(true);
        setScheduleLoading(true);
        try {
            const res = await api.get(`/v1/machines/${machine.id}/schedule`);
            setMachineSchedule(res.data.data || []);
        } catch {
            setMachineSchedule([]);
        } finally {
            setScheduleLoading(false);
        }
    };

    // ── Submit reservation ─────────────────────────────────────────────────
    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            await api.post("/v1/machines/reservations", {
                ...form,
                machine_id: selectedMachine.id
            });
            setStatus({ type: "success", message: "Permohonan reservasi berhasil dikirim." });
            setReservationDialogOpen(false);
            fetchData();
        } catch (err: any) {
            const errorData = err.response?.data;
            let message = errorData?.message || "Gagal membuat reservasi.";
            if (errorData?.errors) {
                const firstErrors = Object.values(errorData.errors)[0] as string[];
                if (firstErrors?.[0]) message = firstErrors[0];
            }
            setStatus({ type: "destructive", message });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Computed values ────────────────────────────────────────────────────
    const durationHours = calcDurationHours(form.start_time, form.end_time);
    const estimatedCost = selectedMachine
        ? durationHours * (selectedMachine.hourly_rate || 0)
        : 0;

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'pending':  return <Badge variant="secondary" className="rounded-lg font-black uppercase text-[10px]">Menunggu</Badge>;
            case 'approved': return <Badge className="bg-success/10 text-success border-success/20 rounded-lg font-black uppercase text-[10px]">Disetujui</Badge>;
            case 'rejected': return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg font-black uppercase text-[10px]">Ditolak</Badge>;
            default:         return <Badge variant="outline" className="rounded-lg font-black uppercase text-[10px]">{s}</Badge>;
        }
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Menghubungkan ke jadwal permesinan...</p>
        </div>
    );

    return (
        <DashboardPageShell
            title="Reservasi Permesinan"
            subtitle="Pinjam fasilitas produksi untuk kebutuhan IKM Anda."
            icon={Wrench}
        >
            <div className="space-y-8">
                {status && (
                    <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="flex items-center justify-between">
                            {status.message}
                            <button onClick={() => setStatus(null)} className="ml-4 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
                                Tutup
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* ── Catalog ──────────────────────────────────────── */}
                    <div className="xl:col-span-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Wrench size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-primary uppercase tracking-tight">Katalog Fasilitas Tersedia</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {machines.map((machine) => (
                                <Card key={machine.id} className="border-border/50 shadow-sm rounded-3xl hover:border-primary/30 transition-all group overflow-hidden bg-white">
                                    {/* Image */}
                                    <div className="relative h-36 bg-muted/30 overflow-hidden flex items-center justify-center">
                                        {machine.image ? (
                                            <img src={machine.image} alt={machine.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <Wrench size={48} className="text-muted-foreground/20" />
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">{machine.brand || '-'}</p>
                                                <h3 className="font-bold text-base">{machine.name}</h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {machine.is_mine && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg font-black uppercase text-[9px]">Milik Anda</Badge>
                                                )}
                                                <Badge variant={machine.is_available ? "default" : "secondary"} className="rounded-lg font-black uppercase text-[9px]">
                                                    {machine.is_available ? 'Tersedia' : 'Sibuk'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-1 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <Tag size={12} className="text-primary" /> {machine.type}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <MapPin size={12} className="text-primary" /> {machine.location || 'Workshop'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                                <CircleDollarSign size={12} /> {formatRp(machine.hourly_rate || 0)}/jam
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => openReserveDialog(machine)}
                                            disabled={!machine.is_available || machine.is_mine}
                                            className="w-full rounded-xl font-bold h-10 gap-2"
                                        >
                                            {machine.is_mine ? 'Milik Anda' : (machine.is_available ? <><Plus size={14} /> Pesan Sekarang</> : 'Tidak Tersedia')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            {machines.length === 0 && (
                                <div className="col-span-2 py-20 text-center text-sm text-muted-foreground font-medium">
                                    Belum ada mesin yang tersedia untuk direservasi.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── My Reservations ──────────────────────────────── */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                <Clock size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-primary uppercase tracking-tight">Status Pesanan Saya</h2>
                        </div>

                        <div className="space-y-4">
                            {myReservations.length === 0 ? (
                                <Card className="border-dashed border-2 bg-muted/10 py-10 text-center">
                                    <CardContent>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Belum ada riwayat pesanan.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                myReservations.map((res) => (
                                    <Card key={res.id} className="border-border/50 shadow-sm rounded-2xl bg-white overflow-hidden">
                                        <div className="bg-muted/30 px-4 py-2 border-b border-border/50 flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">ID: #{res.id}</span>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(res.status)}
                                            </div>
                                        </div>
                                        <CardContent className="p-4 space-y-2">
                                            <p className="font-bold text-sm text-foreground">{res.machine?.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                    <Calendar size={11} className="text-primary" />
                                                    {formatDT(res.start_time)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                    <Clock size={11} className="text-primary" />
                                                    s/d {formatDT(res.end_time)}
                                                </div>
                                                {res.machine?.hourly_rate > 0 && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                                                        <CircleDollarSign size={11} />
                                                        Est. {formatRp(calcDurationHours(res.start_time, res.end_time) * res.machine.hourly_rate)}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`/id/invoice/${res.id}`, '_blank')}
                                                className="w-full h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-1.5 mt-1 border-primary/30 text-primary hover:bg-primary/5"
                                            >
                                                <Download size={11} /> Unduh Bukti Pesanan
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Reservation Dialog ──────────────────────────────────────────── */}
            <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="bg-muted/30 border-b p-6 sticky top-0 z-10">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary">Form Reservasi</DialogTitle>
                        <DialogDescription className="font-medium text-xs">
                            Peminjaman: <span className="text-primary font-bold">{selectedMachine?.name}</span>
                            {selectedMachine?.hourly_rate > 0 && (
                                <span className="ml-2 text-muted-foreground">· {formatRp(selectedMachine.hourly_rate)}/jam</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReserve} className="p-6 space-y-6">

                        {/* ── Visual Schedule Timeline ────────────────────── */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-primary" />
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Jadwal Ketersediaan (7 Hari)</p>
                            </div>
                            {scheduleLoading ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                                    <Loader2 size={12} className="animate-spin" /> Memuat jadwal...
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-muted/20 border border-border/40 p-4">
                                    <MachineTimeline
                                        schedule={machineSchedule}
                                        selStart={form.start_time}
                                        selEnd={form.end_time}
                                    />
                                    {machineSchedule.length === 0 && (
                                        <p className="text-[10px] text-success font-bold mt-2 ml-20">✓ Belum ada slot terpakai</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Time Selection ─────────────────────────────── */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Waktu Mulai</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.start_time}
                                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                        className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Waktu Selesai</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.end_time}
                                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                        className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* ── Price Estimate ─────────────────────────── */}
                            {durationHours > 0 && (
                                <div className="rounded-2xl bg-primary/5 border border-primary/15 px-5 py-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-primary font-bold">
                                        <Info size={13} /> Estimasi Biaya
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {durationHours.toFixed(1)} jam × {formatRp(selectedMachine?.hourly_rate || 0)}
                                        </span>
                                        <span className="text-lg font-black text-primary">
                                            {formatRp(estimatedCost)}
                                        </span>
                                    </div>
                                    {durationHours < 1 && (
                                        <p className="text-[10px] text-destructive font-bold">Durasi minimal 1 jam.</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tujuan Penggunaan</Label>
                                <Textarea
                                    value={form.purpose}
                                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                    placeholder="Jelaskan secara singkat target produksi Anda..."
                                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all resize-none h-24"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="submit"
                                disabled={submitting || durationHours < 1}
                                className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-primary shadow-lg shadow-primary/20"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Kirim Permohonan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPageShell>
    );
}
