"use client";

import { Globe, Users, ClipboardList, TrendingUp, Calendar, ArrowRight, Activity, GraduationCap, Loader2 } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";
import { api } from "@/src/lib/http/axios";
import React, { useEffect, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { useRouter } from "@/src/i18n/navigation";

export const AdvisorDashboardView = ({ user }: { user: any }) => {
  const t = useTranslations("AdvisorDashboardView");
  const router = useRouter();

  const [stats, setStats] = useState({ totalUmkm: 0, activeSessions: 0, pendingTasks: 0, completedSessions: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recentMentoring, setRecentMentoring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, sessRes] = await Promise.all([
          api.get("/v1/mentoring/requests").catch(() => ({ data: { data: [] } })),
          api.get("/v1/mentoring/sessions/my", { params: { upcoming: true } }).catch(() => ({ data: [] })),
        ]);

        const requests: any[] = reqRes.data?.data || [];
        const sessions: any[] = sessRes.data?.data || sessRes.data || [];

        const umkmIds = new Set(requests.map((r: any) => r.umkm?.id).filter(Boolean));
        const active = requests.filter((r: any) => r.status === "ongoing" || r.status === "assigned").length;
        const pending = requests.filter((r: any) => r.status === "pending").length;
        const done = requests.filter((r: any) => r.status === "done").length;

        setStats({ totalUmkm: umkmIds.size, activeSessions: active, pendingTasks: pending, completedSessions: done });
        setUpcoming(sessions.slice(0, 5));
        setRecentMentoring(requests.slice(0, 3));
      } catch (err) {
        console.error("AdvisorDashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metricCards = [
    { title: "Mitra UMKM", value: loading ? "—" : String(stats.totalUmkm), icon: Users, trend: "Ditugaskan", iconColor: "text-primary", iconBg: "bg-primary/10" },
    { title: "Pendampingan Aktif", value: loading ? "—" : String(stats.activeSessions), icon: Activity, trend: "Sedang berjalan", iconColor: "text-success", iconBg: "bg-success/10" },
    { title: "Menunggu Tindakan", value: loading ? "—" : String(stats.pendingTasks), icon: ClipboardList, trend: "Perlu delegasi", iconColor: "text-destructive", iconBg: "bg-destructive/10", accent: stats.pendingTasks > 0 },
    { title: "Selesai", value: loading ? "—" : String(stats.completedSessions), icon: TrendingUp, trend: "Total selesai", iconColor: "text-accent", iconBg: "bg-accent/10" },
  ];

  return (
    <DashboardPageShell
      title={t("title_advisor_dashboard")}
      subtitle={`Selamat datang kembali, ${user?.name}. Kelola bimbingan dan konsultasi UMKM mitra Anda.`}
      icon={GraduationCap}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((stat) => (
          <MetricCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mt-6">
        {/* Upcoming sessions */}
        <SectionCard
          title={t("title_upcoming_consultations")}
          description={t("description_scheduled_mentoring_sessions")}
          icon={Calendar}
          className="lg:col-span-4"
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t("title_no_sessions_scheduled")}
              description={t("description_no_mentoring_sessions_scheduled_for_this")}
            />
          ) : (
            <div className="space-y-3">
              {upcoming.map((session: any) => (
                <div
                  key={session.id}
                  className="p-3.5 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between hover:border-primary/30 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.request?.umkm?.name || session.request?.umkm?.business_name || "Mitra UMKM"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.scheduled_at
                        ? new Date(session.scheduled_at).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                        : "—"} · {session.medium || "online"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] ml-2 bg-primary/5 text-primary border-primary/20 shrink-0">
                    {session.status === "completed" ? "Selesai" : "Terjadwal"}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-1 gap-2 h-9 text-sm" onClick={() => router.push("/workspace/advisor/schedule")}>
                Lihat Semua Jadwal <ArrowRight size={14} />
              </Button>
            </div>
          )}
        </SectionCard>

        {/* Recent mentoring */}
        <div className="lg:col-span-3">
          <SectionCard title="Pendampingan Terkini" icon={Users}>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : recentMentoring.length === 0 ? (
                <EmptyState icon={Globe} title="Belum ada pendampingan" />
              ) : (
                recentMentoring.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all"
                    onClick={() => router.push(`/workspace/advisor/mentoring/${req.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {req.umkm?.business_name || req.umkm?.name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{req.topic}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ml-2 shrink-0 border font-semibold ${
                        req.status === "done" ? "bg-success/10 text-success border-success/20" :
                        req.status === "ongoing" ? "bg-primary/10 text-primary border-primary/20" :
                        req.status === "assigned" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }`}
                    >
                      {req.status === "done" ? "Selesai" :
                       req.status === "ongoing" ? "Berlangsung" :
                       req.status === "assigned" ? "Ditugaskan" : "Menunggu"}
                    </Badge>
                  </div>
                ))
              )}
              <Button className="w-full mt-2 gap-2 h-9 text-sm" onClick={() => router.push("/workspace/advisor/mentoring")}>
                Semua Pendampingan
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
};
