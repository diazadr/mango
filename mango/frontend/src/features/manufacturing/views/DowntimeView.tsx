'use client';

import { useEffect, useState, useCallback } from 'react';
import { manufacturingService } from '@/src/features/manufacturing/services/manufacturingService';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { AlertTriangle, Clock, Plus, StopCircle, Trash2, Wifi, User, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";

const REASON_CODES = [
  { value: 'BREAKDOWN',      label: 'Kerusakan Mesin',     color: '#ef4444' },
  { value: 'SETUP',          label: 'Setup & Penyesuaian', color: '#f97316' },
  { value: 'MINOR_STOP',     label: 'Berhenti Sebentar',   color: '#eab308' },
  { value: 'REDUCED_SPEED',  label: 'Kecepatan Berkurang', color: '#8b5cf6' },
  { value: 'PROCESS_DEFECT', label: 'Cacat Proses',        color: '#ec4899' },
  { value: 'REWORK',         label: 'Pengerjaan Ulang',    color: '#06b6d4' },
  { value: 'OTHER',          label: 'Lainnya',             color: '#6b7280' },
];

function fmtDuration(min: number | null) {
  if (!min) return '—';
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function fmtDt(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function DowntimeView() {
  const t = useTranslations('ManufacturingPage');
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMachine, setFilterMachine] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ machine_id: '', reason_code: 'BREAKDOWN', description: '', is_planned: false });
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { per_page: 10, page };
      if (filterMachine !== 'all') params.machine_id = filterMachine;
      if (filterSource !== 'all') params.source = filterSource;
      const [logsRes, sumRes, machRes] = await Promise.all([
        manufacturingService.getDowntime(params),
        manufacturingService.getDowntimeSummary(filterMachine !== 'all' ? { machine_id: filterMachine } : {}),
        manufacturingService.getMachines(),
      ]);
      setLogs(logsRes.data?.data ?? []);
      setTotalPages(logsRes.data?.meta?.last_page ?? 1);
      setCurrentPage(logsRes.data?.meta?.current_page ?? 1);
      setSummary(sumRes.data);
      setMachines(machRes.data?.data ?? []);
    } catch { toast.error(t('error_load')); }
    finally { setLoading(false); }
  }, [filterMachine, filterSource]);

  useEffect(() => { load(1); }, [load]);

  const handleSubmit = async () => {
    if (!form.machine_id) return toast.error('Pilih mesin');
    setSubmitting(true);
    try {
      await manufacturingService.createDowntime({ machine_id: parseInt(form.machine_id), reason_code: form.reason_code, description: form.description, is_planned: form.is_planned });
      toast.success(t('success_downtime_logged')); setShowDialog(false);
      setForm({ machine_id: '', reason_code: 'BREAKDOWN', description: '', is_planned: false }); load(1);
    } catch (e: any) { toast.error(manufacturingService.parseErrors(e)); }
    finally { setSubmitting(false); }
  };

  const pieData = (summary?.by_reason ?? []).map((r: any) => ({
    name: r.label, value: parseFloat(r.total_min), color: REASON_CODES.find(x => x.value === r.reason_code)?.color ?? '#6b7280',
  }));

  return (
    <DashboardPageShell
        title={t("downtime_tracker")}
        subtitle={t("pantau_waktu_berhenti_mesin_six_big_loss")}
        icon={Activity}
        actions={<Button onClick={() => setShowDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> {t("laporkan_downtime")}</Button>}
    >
      <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Kejadian', value: summary?.total_events ?? 0, cls: 'from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40', textCls: 'text-red-600' },
          { label: 'Total Durasi', value: fmtDuration(summary?.total_min ?? 0), cls: 'from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40', textCls: 'text-orange-600' },
          { label: 'Terencana', value: fmtDuration(summary?.planned_min ?? 0), cls: 'from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40', textCls: 'text-blue-600' },
          { label: 'Tidak Terencana', value: fmtDuration(summary?.unplanned_min ?? 0), cls: 'from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40', textCls: 'text-purple-600' },
        ].map(c => (
          <Card key={c.label} className={`border-0 shadow-sm bg-gradient-to-br ${c.cls}`}>
            <CardContent className="pt-6">
              <div className={`text-3xl font-bold ${c.textCls}`}>{c.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Pareto Chart ─────────────────────────────────────────────────── */}
      {pieData.length > 0 && (() => {
        const sorted = [...pieData].sort((a, b) => b.value - a.value);
        const total = sorted.reduce((s, d) => s + d.value, 0);
        let cum = 0;
        const paretoData = sorted.map(d => {
          cum += d.value;
          return { ...d, cumPct: parseFloat(((cum / total) * 100).toFixed(1)) };
        });
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Analisis Pareto — Six Big Losses
                <span className="ml-auto text-[10px] font-medium text-muted-foreground tracking-wide">{t("diurutkan_dari_durasi_terlama")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={paretoData} margin={{ top: 8, right: 40, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={v => fmtDuration(v)}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    width={44}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }}
                    formatter={(v: any, name: any) =>
                      name === 'cumPct' ? [`${v}%`, 'Kumulatif'] : [fmtDuration(v), 'Durasi']
                    }
                  />
                  <Bar yAxisId="left" dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {paretoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val: any) => fmtDuration(val)}
                      style={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                    />
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumPct"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })()}

      <div className="space-y-4">
        <div className="flex gap-3">
            <Select value={filterMachine} onValueChange={setFilterMachine}>
              <SelectTrigger className="w-48"><SelectValue placeholder={t("placeholder_semua_mesin")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("semua_mesin")}</SelectItem>
                {machines.map((m: any) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-36"><SelectValue placeholder={t("placeholder_sumber")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("semua")}</SelectItem>
                <SelectItem value="edge">{t("iot_edge")}</SelectItem>
                <SelectItem value="manual">{t("manual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      {['Mesin', 'Penyebab', 'Mulai', 'Durasi', 'Sumber', 'Aksi'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("memuat")}</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("belum_ada_data_downtime")}</td></tr>
                    ) : logs.map((log: any) => {
                      const rc = REASON_CODES.find(x => x.value === log.reason_code);
                      return (
                        <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{log.machine?.name ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: `${rc?.color}22`, color: rc?.color }}>{log.reason_label}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDt(log.started_at)}</td>
                          <td className="px-4 py-3">
                            {log.is_active
                              ? <span className="flex items-center gap-1 text-red-500 text-xs animate-pulse"><Clock className="w-3 h-3" /> {t("berlangsung")}</span>
                              : <span className="font-mono text-xs">{fmtDuration(log.duration_min)}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={log.source === 'edge' ? 'default' : 'secondary'} className="gap-1 text-xs">
                              {log.source === 'edge' ? <Wifi className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {log.source_badge}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {log.is_active && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-500" onClick={() => manufacturingService.stopDowntime(log.id).then(() => load(currentPage)).catch(() => toast.error('Gagal'))}>
                                  <StopCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                                onClick={() => setConfirmDelete(log)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t bg-muted/10">
                   <p className="text-xs text-muted-foreground font-medium">Halaman <span className="font-bold text-foreground">{currentPage}</span> dari <span className="font-bold text-foreground">{totalPages}</span></p>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 font-bold" disabled={currentPage <= 1} onClick={() => load(currentPage - 1)}><ChevronLeft size={14} /> {t("sebelumnya")}</Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 font-bold" disabled={currentPage >= totalPages} onClick={() => load(currentPage + 1)}>Berikutnya <ChevronRight size={14} /></Button>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> {t("laporkan_downtime_1")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>{t("mesin")}</Label>
              <Select value={form.machine_id} onValueChange={v => setForm(f => ({ ...f, machine_id: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("placeholder_pilih_mesin")} /></SelectTrigger>
                <SelectContent>{machines.map((m: any) => <SelectItem key={m.id} value={String(m.id)}>{m.name} ({m.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("penyebab")}</Label>
              <Select value={form.reason_code} onValueChange={v => setForm(f => ({ ...f, reason_code: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASON_CODES.map(rc => (
                    <SelectItem key={rc.value} value={rc.value}>
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full inline-block" style={{ background: rc.color }} />{rc.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("keterangan")}</Label>
              <Textarea className="mt-1" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.is_planned} onCheckedChange={(checked) => setForm(f => ({ ...f, is_planned: checked === true }))} />
              <span className="text-sm">{t("downtime_terencana_maintenance")}</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{t("batal")}</Button>
              <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Catat Downtime'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {confirmDelete && (
        <Dialog open onOpenChange={() => setConfirmDelete(null)}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Hapus Data Downtime</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Apakah Anda yakin ingin menghapus data downtime untuk mesin <b>{confirmDelete.machine?.name}</b>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t("batal")}</Button>
                    <Button variant="destructive" onClick={() => {
                        manufacturingService.deleteDowntime(confirmDelete.id).then(() => load(currentPage));
                        setConfirmDelete(null);
                    }}>Hapus</Button>
                </div>
            </DialogContent>
        </Dialog>
      )}
      </div>
    </DashboardPageShell>
  );
}
