import { Store, Package, TrendingUp, Star, Box, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";

export const UmkmDashboardView = ({ user }: { user: any }) => {
    const stats = [
        { title: "Inventory SKU", value: "24", icon: Package, trend: "In stock", color: "text-primary", bg: "bg-primary/10" },
        { title: "Annual revenue", value: "125M", icon: TrendingUp, trend: "+15% MoM", color: "text-success", bg: "bg-success/10" },
        { title: "Market rating", value: "4.8", icon: Star, trend: "Excellent", color: "text-warning", bg: "bg-warning/10" },
        { title: "Active orders", value: "7", icon: Box, trend: "Processing", color: "text-accent", bg: "bg-accent/10", accent: true },
    ];

    return (
        <DashboardPageShell
            title="Business dashboard"
            subtitle={`Welcome back, ${user?.name}. Monitoring your business production and sales performance.`}
            icon={Store}
            actions={
                user?.umkm?.slug && (
                    <Link href={`/umkm/${user.umkm.slug}`} target="_blank">
                        <Button variant="outline" className="rounded-xl gap-2 font-bold h-11 border-primary/20 hover:bg-primary/5 text-primary">
                            <ExternalLink size={16} /> View public profile
                        </Button>
                    </Link>
                )
            }
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
                    title="Strategic profile status"
                    description="Your business identity synchronization progress."
                    icon={ShieldCheck}
                    badge={<Badge variant="info">85% complete</Badge>}
                    className="lg:col-span-4"
                >
                    <div className="w-full max-w-md mx-auto space-y-4 py-4">
                        <ProgressBar label="Overall completion" value={85} color="primary" />
                        <p className="text-sm text-muted-foreground pt-2">
                            Complete your legal documentation to unlock full access to the Marketing Hub and Ecosystem Analytics.
                        </p>
                        <Button className="mt-4 gap-2">
                            Complete profile <ArrowRight size={16} />
                        </Button>
                    </div>
                </SectionCard>

                <div className="lg:col-span-3 space-y-6">
                    <SectionCard title="Quick operations">
                        <div className="space-y-2">
                            <QuickActionCard label="Add new product" icon={Package} />
                            <QuickActionCard label="Update stock level" icon={Box} iconBg="bg-success/10" iconColor="text-success" />
                            <QuickActionCard label="Marketing assets" icon={Star} iconBg="bg-warning/10" iconColor="text-warning" />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </DashboardPageShell>
    );
};