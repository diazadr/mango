"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, ExternalLink, Loader2, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { manufacturingService, type EdgeSite } from "../services/manufacturingService";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Badge } from "@/src/components/ui/badge";

interface EdgeSyncStatusPanelProps {
    /** Pass pre-fetched sites to avoid extra fetch. If undefined, will fetch internally. */
    sites?: EdgeSite[];
    loading?: boolean;
}

function SiteRow({ site }: { site: EdgeSite }) {
    const t = useTranslations("EdgeSyncStatusPanel");
    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
            site.is_online ? "bg-success/5" : "bg-muted/20"
        }`}>
            <div className="flex items-center gap-2 min-w-0">
                {/* Status dot */}
                <span className="relative flex h-2 w-2 shrink-0">
                    {site.is_online && (
                        <span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" />
                    )}
                    <span className={`relative rounded-full h-2 w-2 ${site.is_online ? "bg-success" : "bg-muted-foreground/30"}`} />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{site.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{site.site_id}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {site.is_online ? (
                    <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/20 py-0 h-4">
                        <CheckCircle2 size={8} className="mr-0.5" /> {t("online")}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground py-0 h-4">
                        {site.last_sync_at
                            ? <><Clock size={8} className="mr-0.5" /> {t("minutes_ago", { min: site.minutes_since_sync ?? 0 })}</>
                            : t("not_synced")
                        }
                    </Badge>
                )}
            </div>
        </div>
    );
}

export function EdgeSyncStatusPanel({ sites: propSites, loading: propLoading }: EdgeSyncStatusPanelProps) {
    const t = useTranslations("EdgeSyncStatusPanel");
    const [sites, setSites] = useState<EdgeSite[]>(propSites ?? []);
    const [loading, setLoading] = useState(propLoading ?? (!propSites));

    useEffect(() => {
        if (propSites !== undefined) {
            setSites(propSites);
            return;
        }
        // Self-fetch if no sites passed in
        setLoading(true);
        manufacturingService.getEdgeSites()
            .then(res => setSites(res.data?.data?.sites ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [propSites]);

    const onlineCount = sites.filter(s => s.is_online).length;
    const totalCount = sites.length;

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30 border border-border/50 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="h-3 w-40 rounded bg-muted-foreground/20" />
            </div>
        );
    }

    if (totalCount === 0) {
        return (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-muted/20 border-border/40">
                <div className="flex items-center gap-2">
                    <WifiOff size={14} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{t("no_sites_registered")}</p>
                </div>
                <Link href="/workspace/manufacturing/edge-sites">
                    <button className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1">
                        <ExternalLink size={10} /> {t("manage")}
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-border/40 ${
                onlineCount > 0 ? "bg-success/5" : "bg-muted/20"
            }`}>
                <div className="flex items-center gap-2">
                    {onlineCount > 0
                        ? <Wifi size={13} className="text-success" />
                        : <WifiOff size={13} className="text-muted-foreground" />
                    }
                    <span className="text-xs font-semibold text-foreground">
                        {t("edge_online_status", { online: onlineCount, total: totalCount })}
                    </span>
                </div>
                <Link href="/workspace/manufacturing/edge-sites">
                    <button className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1">
                        <ExternalLink size={10} /> {t("manage_sites")}
                    </button>
                </Link>
            </div>
            {/* Site rows */}
            <div className="p-2 space-y-1">
                {sites.map(site => <SiteRow key={site.id} site={site} />)}
            </div>
        </div>
    );
}
