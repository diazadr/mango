import { Globe, Users, ClipboardList, TrendingUp, Calendar, ArrowRight, Activity, ArrowUpRight } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";

export const AdvisorDashboardView = ({ user }: { user: any }) => {
    const stats = [
        { title: "Managed UMKM", value: "12", icon: Users, trend: "Assigned", color: "text-primary", bg: "bg-primary/10" },
        { title: "Pending review", value: "5", icon: ClipboardList, trend: "Urgent action", color: "text-destructive", bg: "bg-destructive/10", accent: true },
        { title: "Growth index", value: "82%", icon: TrendingUp, trend: "+2.4% MoM", color: "text-success", bg: "bg-success/10" },
        { title: "Consultations", value: "28", icon: Globe, trend: "Total sessions", color: "text-accent", bg: "bg-accent/10" },
    ];

    return (
        <DashboardPageShell
            title="Advisor dashboard"
            subtitle={`Welcome back, ${user?.name}. Overseeing business development and consultation streams.`}
            icon={Globe}
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
                    title="Upcoming consultations"
                    description="Scheduled mentoring sessions."
                    icon={Calendar}
                    className="lg:col-span-4"
                >
                    <EmptyState
                        icon={Globe}
                        title="No sessions scheduled"
                        description="No mentoring sessions scheduled for this cycle."
                        actionLabel="View calendar"
                    />
                </SectionCard>

                <div className="lg:col-span-3 space-y-6">
                    <SectionCard
                        title="High-growth UMKM"
                        icon={ArrowUpRight}
                    >
                        <div className="space-y-3">
                            {[1, 2].map((item) => (
                                <div key={item} className="p-3.5 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">UMKM-NODE-{item}04</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">+14.2% Revenue growth</p>
                                    </div>
                                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                            <Button className="w-full mt-2 gap-2">
                                Full analytics report
                            </Button>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </DashboardPageShell>
    );
};