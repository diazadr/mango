"use client";

import { useEffect, useState } from "react";
import { Store, Package, TrendingUp, Star, Box, ArrowRight, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";
import { useTranslations } from "next-intl";
import { productService } from "../../umkm-products/services/productService";
import { manufacturingService } from "../../manufacturing/services/manufacturingService";

interface UmkmData {
  product_count: number;
  active_orders: number;
  completed_orders: number;
  total_production: number;
  profile_completion: number;
}

export const UmkmDashboardView = ({ user }: { user: any }) => {
    const t = useTranslations("DashboardPage");
    const [data, setData] = useState<UmkmData>({
        product_count: 0,
        active_orders: 0,
        completed_orders: 0,
        total_production: 0,
        profile_completion: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [productsRes, manufacturingRes] = await Promise.all([
                    productService.getProducts().catch(() => ({ data: { data: [] } })),
                    manufacturingService.getSummary().catch(() => ({ data: { data: null } }))
                ]);

                const productList = productsRes.data?.data || [];
                const mSummary = manufacturingRes.data?.data;

                // Calculate completion roughly based on filled fields
                const umkm = user?.umkm || {};
                const fields = ['name', 'description', 'address', 'nib', 'phone', 'logo_url', 'established_year'];
                const filled = fields.filter(f => !!umkm[f]).length;
                const completion = Math.round((filled / fields.length) * 100);

                setData({
                    product_count: productList.length,
                    active_orders: mSummary?.work_orders?.in_progress || 0,
                    completed_orders: mSummary?.work_orders?.completed || 0,
                    total_production: mSummary?.production?.good_quantity || 0,
                    profile_completion: completion
                });
            } catch (err) {
                console.error("Failed to fetch UMKM dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    if (loading) {
        return (
            <DashboardPageShell title={t("umkm_title")} icon={Store}>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardPageShell>
        );
    }
    
    const stats = [
        { title: t("stat_inventory_sku"), value: data.product_count.toString(), icon: Package, trend: t("trend_in_stock"), color: "text-primary", bg: "bg-primary/10" },
        { title: t("stat_active_orders") || "Active Orders", value: data.active_orders.toString(), icon: Box, trend: t("trend_processing") || "Processing", color: "text-accent", bg: "bg-accent/10", accent: data.active_orders > 0 },
        { title: "Completed Orders", value: data.completed_orders.toString(), icon: ShieldCheck, trend: "Done", color: "text-success", bg: "bg-success/10" },
        { title: "Total Production", value: data.total_production.toString(), icon: TrendingUp, trend: "Good Qty", color: "text-warning", bg: "bg-warning/10" },
    ];

    return (
        <DashboardPageShell
            title={t("umkm_title")}
            subtitle={`${t("welcome_back") || 'Welcome back'}, ${user?.name}. ${t("umkm_subtitle")}`}
            icon={Store}
            actions={
                user?.umkm?.slug && (
                    <Link href={`/umkm/${user.umkm.slug}`} target="_blank">
                        <Button variant="outline" className="rounded-xl gap-2 font-bold h-11 border-primary/20 hover:bg-primary/5 text-primary">
                            <ExternalLink size={16} /> {t("view_public_profile")}
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
        </DashboardPageShell>
    );
};
