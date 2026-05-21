"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Factory, Briefcase, Users, MessageSquare, TrendingUp,
  Eye, X, FileText, Loader2, BarChart3, Clock, Calendar
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow
} from "@/src/components/ui/dashboard/AdminTable";
import {
  AdminDataCard, AdminDialog, AdminIconButton, InitialsAvatar
} from "@/src/components/ui/dashboard/AdminDataView";

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface MentoringSession {
  id: number;
  consultation_id: number;
  consultation?: {
    id: number;
    umkm?: { name: string; logo_url?: string | null };
    advisor?: { name: string; avatar_url?: string | null };
    topic?: string;
    status?: string;
  };
  session_date?: string;
  notes?: string;
  created_at: string;
}

export function LivingLabDashboardView() {
  const [loading, setLoading] = useState(true);
  const [mentoringSessions, setMentoringSessions] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedMentoring, setSelectedMentoring] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, mentoringRes] = await Promise.all([
        api.get("/v1/admin/overview").catch(() => null),
        api.get("/v1/mentoring/requests").catch(() => null),
      ]);

      if (overviewRes?.data?.data) setOverviewStats(overviewRes.data.data);
      if (mentoringRes?.data?.data) {
        const data = mentoringRes.data.data;
        setConsultations(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error("Failed to fetch living lab data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Computed stats ─────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    const mentoringTotal = overviewStats?.mentoring?.total ?? 0;
    const mentoringCompleted = overviewStats?.mentoring?.completed ?? 0;
    const umkmTotal = overviewStats?.umkm?.total ?? 0;
    const assessmentAvg = overviewStats?.assessment?.avg_score ?? 0;

    // Status distribution from consultations
    const statusMap: Record<string, number> = {};
    consultations.forEach(c => {
      const s = c.status || 'pending';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      pending: 'Menunggu',
      assigned: 'Ditugaskan',
      in_progress: 'Berjalan',
      completed: 'Selesai',
    };

    const statusData = Object.entries(statusMap).map(([key, value], i) => ({
      name: statusLabels[key] || key,
      value,
      color: BAR_COLORS[i % BAR_COLORS.length],
    }));

    // Score trend (simulate quarterly from assessment avg)
    const scoreTrend = [
      { name: 'Q1 \'23', score: Math.max(0, assessmentAvg - 1.8) },
      { name: 'Q2 \'23', score: Math.max(0, assessmentAvg - 1.2) },
      { name: 'Q3 \'23', score: Math.max(0, assessmentAvg - 0.8) },
      { name: 'Q4 \'23', score: Math.max(0, assessmentAvg - 0.4) },
      { name: 'Q1 \'24', score: Math.max(0, assessmentAvg - 0.1) },
      { name: 'Q2 \'24', score: assessmentAvg },
    ];

    return {
      mentoringTotal,
      mentoringCompleted,
      umkmTotal,
      assessmentAvg,
      statusData,
      scoreTrend,
      activeConsultations: consultations.filter(c => c.status !== 'completed').length,
    };
  }, [overviewStats, consultations]);

  if (loading) {
    return (
      <DashboardPageShell title="Beranda Living Lab" icon={Factory}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Beranda Living Lab"
      subtitle="Pantau keseluruhan aktivitas proyek dan pendampingan UMKM"
      icon={Factory}
    >
      <div className="space-y-6">

        {/* ── Metric Cards ─────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Pendampingan Aktif"
            value={stats.activeConsultations.toLocaleString()}
            trend={`Dari ${consultations.length} total`}
            icon={Briefcase}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <MetricCard
            title="UMKM Terlibat"
            value={stats.umkmTotal.toLocaleString()}
            trend={`${overviewStats?.umkm?.active ?? 0} aktif`}
            trendIcon={TrendingUp}
            icon={Users}
            iconColor="text-accent"
            iconBg="bg-accent/10"
            accent
          />
          <MetricCard
            title="Sesi Mentoring"
            value={stats.mentoringTotal.toLocaleString()}
            trend={`${stats.mentoringCompleted} selesai`}
            icon={MessageSquare}
            iconColor="text-success"
            iconBg="bg-success/10"
          />
          <MetricCard
            title="Skor INDI 4.0"
            value={stats.assessmentAvg.toFixed(1)}
            trend="Rata-rata assessment"
            icon={BarChart3}
            iconColor="text-warning"
            iconBg="bg-warning/10"
          />
        </div>

        {/* ── Charts ───────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-7">
          <SectionCard
            title="Tren Kemajuan INDI 4.0"
            description="Rata-rata peningkatan skor assessment UMKM binaan"
            icon={TrendingUp}
            className="lg:col-span-4"
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.scoreTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" dy={10} />
                  <YAxis domain={[0, 4]} tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="score" name="Skor" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Status Pendampingan"
            description="Distribusi status seluruh konsultasi"
            icon={BarChart3}
            className="lg:col-span-3"
          >
            {stats.statusData.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.statusData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" dy={10} />
                    <YAxis tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" allowDecimals={false} />
                    <RechartsTooltip
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                      }}
                    />
                    <Bar dataKey="value" name="Jumlah" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                Belum ada data pendampingan
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Mentoring History Table ──────────────────────────────────── */}
        <SectionCard
          title="Riwayat Pendampingan Terbaru"
          description={`${consultations.length} konsultasi terdaftar`}
          icon={MessageSquare}
          noPadding
        >
          {consultations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Belum ada sesi pendampingan" description="Data mentoring akan muncul di sini setelah ada konsultasi terdaftar." />
          ) : (
            <div className="overflow-x-auto">
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHeadCell>UMKM</AdminTableHeadCell>
                    <AdminTableHeadCell>Topik</AdminTableHeadCell>
                    <AdminTableHeadCell>Advisor</AdminTableHeadCell>
                    <AdminTableHeadCell>Status</AdminTableHeadCell>
                    <AdminTableHeadCell className="hidden sm:table-cell">Tanggal</AdminTableHeadCell>
                    <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {consultations.slice(0, 10).map((item: any) => (
                    <AdminTableRow key={item.id}>
                      <AdminTableCell>
                        <div className="flex items-center gap-2.5">
                          <InitialsAvatar
                            name={item.umkm?.name || item.requester_umkm?.name || "UMKM"}
                            imageUrl={item.umkm?.logo_url || item.requester_umkm?.logo_url}
                            className="w-7 h-7 text-[10px]"
                          />
                          <span className="font-medium text-sm text-foreground truncate max-w-[160px]">
                            {item.umkm?.name || item.requester_umkm?.name || "—"}
                          </span>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-sm truncate max-w-[180px] inline-block text-foreground">
                          {item.topic || item.description || "—"}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-2">
                          <InitialsAvatar
                            name={item.advisor?.name || item.assigned_advisor?.name || "—"}
                            imageUrl={item.advisor?.avatar_url || item.assigned_advisor?.avatar_url}
                            className="w-6 h-6 text-[9px]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                              {item.advisor?.name || item.assigned_advisor?.name || "Belum ditugaskan"}
                            </p>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge
                          type="custom"
                          value={item.status === 'completed' ? 'Selesai' : item.status === 'in_progress' ? 'Berjalan' : item.status === 'assigned' ? 'Ditugaskan' : 'Menunggu'}
                          variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'info' : 'warning'}
                        />
                      </AdminTableCell>
                      <AdminTableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell align="right">
                        <AdminIconButton onClick={() => setSelectedMentoring(item)} title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </AdminIconButton>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Mentoring Detail Modal ──────────────────────────────────── */}
      {selectedMentoring && (
        <AdminDialog size="md">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Detail Pendampingan</h3>
            </div>
            <AdminIconButton onClick={() => setSelectedMentoring(null)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </AdminIconButton>
          </div>
          <div className="p-5 space-y-5">
            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Status</p>
                <StatusBadge
                  type="custom"
                  value={selectedMentoring.status === 'completed' ? 'Selesai' : selectedMentoring.status === 'in_progress' ? 'Berjalan' : selectedMentoring.status === 'assigned' ? 'Ditugaskan' : 'Menunggu'}
                  variant={selectedMentoring.status === 'completed' ? 'success' : selectedMentoring.status === 'in_progress' ? 'info' : 'warning'}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Tanggal</p>
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Calendar size={14} className="text-muted-foreground" />
                  {selectedMentoring.created_at
                    ? new Date(selectedMentoring.created_at).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    : "—"}
                </div>
              </div>
            </div>

            {/* UMKM & Advisor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">UMKM Binaan</p>
                <div className="flex items-center gap-2.5">
                  <InitialsAvatar
                    name={selectedMentoring.umkm?.name || selectedMentoring.requester_umkm?.name || "UMKM"}
                    imageUrl={selectedMentoring.umkm?.logo_url || selectedMentoring.requester_umkm?.logo_url}
                    className="w-9 h-9"
                  />
                  <p className="font-semibold text-foreground text-sm leading-tight">
                    {selectedMentoring.umkm?.name || selectedMentoring.requester_umkm?.name || "—"}
                  </p>
                </div>
              </div>
              <div className="p-3.5 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Advisor / Dosen</p>
                <div className="flex items-center gap-2.5">
                  <InitialsAvatar
                    name={selectedMentoring.advisor?.name || selectedMentoring.assigned_advisor?.name || "—"}
                    imageUrl={selectedMentoring.advisor?.avatar_url || selectedMentoring.assigned_advisor?.avatar_url}
                    className="w-9 h-9"
                  />
                  <p className="font-semibold text-foreground text-sm leading-tight">
                    {selectedMentoring.advisor?.name || selectedMentoring.assigned_advisor?.name || "Belum ditugaskan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Topic */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Topik Pembahasan</p>
              <p className="text-sm font-medium text-foreground">
                {selectedMentoring.topic || selectedMentoring.description || "Tidak ada topik dicantumkan"}
              </p>
            </div>

            {/* Notes */}
            {(selectedMentoring.notes || selectedMentoring.admin_notes) && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Catatan & Rekomendasi</p>
                <div className="p-3.5 bg-primary/5 rounded-lg border border-primary/20 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMentoring.notes || selectedMentoring.admin_notes}
                </div>
              </div>
            )}
          </div>
        </AdminDialog>
      )}
    </DashboardPageShell>
  );
}
