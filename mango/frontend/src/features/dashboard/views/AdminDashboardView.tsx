"use client";

import { useEffect, useState } from "react";
import { 
  Users, Building2, Zap, ShieldCheck, 
  Activity, Database, Loader2, BarChart3,
  BookOpen, MessageSquare, Calendar, Wifi, WifiOff, Server
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";
import { userAdminService } from "../../admin-users/services/userAdminService";
import { overviewService, type OverviewStats, type EdgeConnectionStatus } from "../services/overviewService";
import { useTranslations } from "next-intl";
import { cn } from "@/src/lib/utils";

export const AdminDashboardView = () => {
  const t = useTranslations("DashboardPage");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [edgeStatus, setEdgeStatus] = useState<EdgeConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, usersRes, edgeRes] = await Promise.all([
          overviewService.getStats().catch(() => null),
          userAdminService.getUsers({ per_page: 5 }).catch(() => null),
          overviewService.getEdgeStatus().catch(() => null),
        ]);

        if (overviewRes?.data?.data) setStats(overviewRes.data.data);
        if (usersRes?.data?.data) setRecentUsers(usersRes.data.data);
        if (edgeRes?.data?.data) setEdgeStatus(edgeRes.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardPageShell title={t("admin_title")} icon={Activity}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardPageShell>
    );
  }

  const metricCards = [
    { 
      title: "Total UMKM", 
      value: stats?.umkm.total?.toLocaleString() ?? "—", 
      trend: `${stats?.umkm.active ?? 0} aktif · ${stats?.umkm.pending ?? 0} pending`,
      icon: Building2, color: "text-primary", bg: "bg-primary/10"
    },
    { 
      title: "Total Pengguna", 
      value: stats?.users.total?.toLocaleString() ?? "—", 
      trend: `+${stats?.users.new_this_month ?? 0} bulan ini`,
      icon: Users, color: "text-accent", bg: "bg-accent/10", accent: true
    },
    { 
      title: "Total Assessment", 
      value: stats?.assessment.total?.toLocaleString() ?? "—", 
      trend: `Rata-rata skor: ${stats?.assessment.avg_score ?? 0}`,
      icon: BarChart3, color: "text-success", bg: "bg-success/10"
    },
    { 
      title: "Mentoring", 
      value: stats?.mentoring.total?.toLocaleString() ?? "—", 
      trend: `${stats?.mentoring.completed ?? 0} selesai`,
      icon: MessageSquare, color: "text-warning", bg: "bg-warning/10"
    },
  ];

  return (
    <DashboardPageShell 
      title={t("admin_title")} 
      subtitle={t("admin_subtitle")}
      icon={Activity}
    >
      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
            iconColor={card.color}
            iconBg={card.bg}
            accent={card.accent}
          />
        ))}
      </div>



      {/* ── Main Content: Table + Distribution ───────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7 mt-6">
        <SectionCard
          title={t("recent_users")}
          description={t("recent_users_desc")}
          noPadding
          className="lg:col-span-4"
        >
          <div className="overflow-x-auto">
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>{t("user_column")}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t("role_column")}</AdminTableHeadCell>
                  <AdminTableHeadCell className="hidden sm:table-cell">{t("joined_column")}</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <AdminTableRow key={user.email}>
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge type="role" value={user.roles?.[0]?.name || user.roles?.[0] || ""} />
                      </AdminTableCell>
                      <AdminTableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : '—'}
                        </span>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                ) : (
                  <AdminTableRow>
                    <AdminTableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      {t("no_recent_users")}
                    </AdminTableCell>
                  </AdminTableRow>
                )}
              </AdminTableBody>
            </AdminTable>
          </div>
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <SectionCard title={t("title_statistik_platform")} icon={BarChart3}>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{t("artikel")}</span>
                </div>
                <span className="font-bold text-primary">{stats?.articles.total ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{t("reservasi_mesin")}</span>
                </div>
                <span className="font-bold text-accent">{stats?.reservation.total ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{t("edge_sites_aktif")}</span>
                </div>
                <span className="font-bold text-success">{stats?.edge.active_sites ?? 0}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
};
