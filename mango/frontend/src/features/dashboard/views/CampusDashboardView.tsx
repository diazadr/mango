"use client";

import { useEffect, useState } from "react";
import { 
  Users, Building2, GraduationCap, MessageSquare, 
  School, Clock, CheckCircle2, Loader2
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";
import { campusService } from "../../admin-campus/services/campusService";
import { mentoringService } from "../../mentoring/services/mentoringService";
import { umkmAdminService } from "../../admin-umkm/services/umkmAdminService";

interface CampusData {
  total_umkm: number;
  total_advisors: number;
  total_requests: number;
  pending_requests: number;
  completed_sessions: number;
  recent_requests: any[];
}

export const CampusDashboardView = () => {
  const t = useTranslations("DashboardPage");
  const [data, setData] = useState<CampusData>({
    total_umkm: 0,
    total_advisors: 0,
    total_requests: 0,
    pending_requests: 0,
    completed_sessions: 0,
    recent_requests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [umkmRes, advisorRes, mentoringRes] = await Promise.all([
          umkmAdminService.getUmkmList().catch(() => ({ data: { data: [] } })),
          campusService.getAdvisors({ per_page: 1 }).catch(() => ({ data: { data: [], meta: { total: 0 } } })),
          mentoringService.getRequests().catch(() => ({ data: { data: [] } }))
        ]);

        const umkmList = umkmRes.data?.data || umkmRes.data || [];
        const advisorMeta = advisorRes.data?.meta;
        const mentoringList = mentoringRes.data?.data || mentoringRes.data || [];
        
        const pending = mentoringList.filter((r: any) => r.status === 'pending').length;
        const completed = mentoringList.filter((r: any) => r.status === 'completed').length;

        setData({
          total_umkm: umkmList.length,
          total_advisors: advisorMeta?.total || 0,
          total_requests: mentoringList.length,
          pending_requests: pending,
          completed_sessions: completed,
          recent_requests: mentoringList.slice(0, 5)
        });
      } catch (err) {
        console.error("Failed to fetch campus dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardPageShell title={t("campus_title")} icon={School}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardPageShell>
    );
  }

  const stats = [
    { title: t("stat_total_umkm"), value: data.total_umkm.toString(), trend: t("trend_umkm"), icon: Building2, color: "text-primary", bg: "bg-primary/10" },
    { title: t("stat_total_advisors"), value: data.total_advisors.toString(), trend: t("trend_advisors"), icon: GraduationCap, color: "text-accent", bg: "bg-accent/10" },
    { title: t("stat_mentoring_requests"), value: data.total_requests.toString(), trend: "", icon: MessageSquare, color: "text-warning", bg: "bg-warning/10", accent: data.pending_requests > 0 },
    { title: t("stat_completed_sessions"), value: data.completed_sessions.toString(), trend: "", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <DashboardPageShell 
      title={t("campus_title")} 
      subtitle={t("campus_subtitle")}
      icon={School}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            iconColor={stat.color}
            iconBg={stat.bg}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mt-6">
        <SectionCard
          title={t("recent_requests")}
          description={t("recent_requests_desc")}
          badge={data.pending_requests > 0 ? <Badge variant="warning">{data.pending_requests} Pending</Badge> : undefined}
          noPadding
          className="lg:col-span-4"
        >
          {data.recent_requests.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={t("activity_log")}
              description={t("delegate_desc")}
            />
          ) : (
            <div className="p-0">
               {/* Simplified list of recent requests if needed, otherwise keep EmptyState for now as placeholder for log */}
               <EmptyState
                icon={Clock}
                title={t("activity_log")}
                description={t("delegate_desc")}
              />
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardPageShell>
  );
};
