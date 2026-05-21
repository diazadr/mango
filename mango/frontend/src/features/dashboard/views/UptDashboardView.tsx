"use client";

import { useEffect, useState } from "react";
import { 
  Building2, Store, ShieldCheck, 
  Users, Clock, Loader2
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";
import { umkmAdminService } from "../../admin-umkm/services/umkmAdminService";
import { organizationApprovalsService } from "../../admin-approvals/services/organizationApprovalsService";

interface UptData {
  total_umkm: number;
  pending_approvals: number;
  total_members: number;
}

export const UptDashboardView = () => {
  const t = useTranslations("DashboardPage");
  const [data, setData] = useState<UptData>({
    total_umkm: 0,
    pending_approvals: 0,
    total_members: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [umkmRes, pendingRes] = await Promise.all([
          umkmAdminService.getUmkmList().catch(() => ({ data: { data: [] } })),
          organizationApprovalsService.getPendingUmkms().catch(() => ({ data: { data: [] } }))
        ]);

        const umkmList = umkmRes.data?.data || umkmRes.data || [];
        const pendingList = pendingRes.data?.data || pendingRes.data || [];
        
        // Members might be distinct owners or users, for now use a logic based on available data
        // If the backend has a specific UPT member endpoint, we should use that.
        
        setData({
          total_umkm: umkmList.length,
          pending_approvals: pendingList.length,
          total_members: umkmList.length + pendingList.length // Placeholder logic
        });
      } catch (err) {
        console.error("Failed to fetch UPT dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardPageShell title={t("upt_title")} icon={Building2}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardPageShell>
    );
  }

  const stats = [
    { title: t("stat_total_umkm"), value: data.total_umkm.toString(), trend: t("trend_umkm"), icon: Store, color: "text-primary", bg: "bg-primary/10" },
    { title: t("stat_pending_approvals"), value: data.pending_approvals.toString(), trend: t("trend_new_applicants"), icon: Clock, color: "text-warning", bg: "bg-warning/10", accent: data.pending_approvals > 0 },
    { title: t("stat_total_members"), value: data.total_members.toString(), trend: t("trend_unit_ecosystem"), icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { title: t("stat_active_orgs"), value: "1", trend: "Main unit", icon: Building2, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <DashboardPageShell 
      title={t("upt_title")} 
      subtitle={t("upt_subtitle")}
      icon={Building2}
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
    </DashboardPageShell>
  );
};
