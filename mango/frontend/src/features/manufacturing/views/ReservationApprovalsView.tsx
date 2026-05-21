"use client";

import {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

import api from "@/src/lib/http/axios";
import { useAuth } from "@/src/components/providers/AuthProvider";

import {
    Loader2,
    Search,
    Filter,
    Calendar,
    Clock,
    Eye,
    X
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/i18n/navigation";

import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/src/components/ui/card";

import { Badge } from "@/src/components/ui/badge";

import {
    Alert,
    AlertDescription,
} from "@/src/components/ui/alert";

import {
    AdminToolbar,
    AdminSearchFilter,
    AdminSelectFilter,
} from "@/src/components/ui/dashboard/AdminDataView";

import {
    AdminTable,
    AdminTableHeader,
    AdminTableBody,
    AdminTableRow,
    AdminTableHeadCell,
    AdminTableCell,
} from "@/src/components/ui/dashboard/AdminTable";

import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";

function formatRp(
    n: number
) {
    return (
        "Rp " +
        Number(
            n || 0
        ).toLocaleString(
            "id-ID"
        )
    );
}

function formatDT(
    s: string
) {
    if (!s)
        return "-";

    const d =
        new Date(s);

    return (
        d.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ) +
        " · " +
        d.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        )
    );
}

function diffHours(
    a: string,
    b: string
) {
    return Math.max(
        0,
        (
            new Date(
                b
            ).getTime() -
            new Date(
                a
            ).getTime()
        ) / 3600000
    );
}

const getMachineImage = (
    machine: any
) => {
    if (!machine)
        return null;

    const candidates = [
        machine.image_url,
        machine.image,
        machine.thumbnail,
        machine.photo,
        machine.picture,
        machine.cover,
        machine.banner,
    ];

    if (
        Array.isArray(
            machine.images
        ) &&
        machine.images.length >
            0
    ) {
        const first =
            machine.images[0];

        if (
            typeof first ===
            "string"
        ) {
            candidates.unshift(
                first
            );
        } else {
            candidates.unshift(
                first?.url,
                first?.image_url,
                first?.path
            );
        }
    }

    const image =
        candidates.find(
            (
                item
            ) =>
                item &&
                typeof item ===
                    "string"
        );

    if (!image)
        return null;

    if (
        image.startsWith(
            "http"
        )
    ) {
        return image;
    }

    const baseUrl =
        (
            process
                .env
                .NEXT_PUBLIC_API_URL ||
            ""
        ).replace(
            "/api",
            ""
        );

    return `${baseUrl}${image}`;
};

const getOwnerLogo = (machine: any) => {
    if (!machine) return null;
    return (
        machine.owner_logo ||
        machine.owner_logo_url ||
        machine.owner?.logo_url ||
        machine.owner?.image_url ||
        null
    );
};

const getCompanyLogo = (
    req: any
) => {
    const candidates = [
        req.machine
            ?.owner_logo,
        req.machine
            ?.owner_logo_url,
        req.machine
            ?.company_logo,
        req.machine
            ?.organization_logo,
        req.requester_umkm
            ?.logo,
        req.requester_umkm
            ?.logo_url,
        req.requester_umkm
            ?.image,
    ];

    const image =
        candidates.find(
            (
                item
            ) =>
                item &&
                typeof item ===
                    "string"
        );

    if (!image)
        return null;

    if (
        image.startsWith(
            "http"
        )
    ) {
        return image;
    }

    const baseUrl =
        (
            process
                .env
                .NEXT_PUBLIC_API_URL ||
            ""
        ).replace(
            "/api",
            ""
        );

    return `${baseUrl}${image}`;
};

const capitalizeLabel = (
    value: string
) => {
    if (!value)
        return "";

    return (
        value.charAt(
            0
        ).toUpperCase() +
        value
            .slice(1)
            .toLowerCase()
    );
};

const statusMap: Record<
    string,
    {
        label: string;
        cls: string;
    }
> = {
    pending: {
        label:
            "Menunggu",
        cls:
            "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },

    negotiating: {
        label:
            "Negosiasi",
        cls:
            "bg-primary/10 text-primary border-primary/20",
    },

    approved: {
        label:
            "Disetujui",
        cls:
            "bg-success/10 text-success border-success/20",
    },

    rejected: {
        label:
            "Ditolak",
        cls:
            "bg-destructive/10 text-destructive border-destructive/20",
    },

    completed: {
        label:
            "Selesai",
        cls:
            "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
};

const payStatusMap: Record<
    string,
    {
        label: string;
        cls: string;
    }
> = {
    unpaid: {
        label:
            "Belum bayar",
        cls:
            "bg-muted/30 text-muted-foreground",
    },

    awaiting_confirmation:
        {
            label:
                "Menunggu konfirmasi",
            cls:
                "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        },

    paid: {
        label:
            "Lunas",
        cls:
            "bg-success/10 text-success border-success/20",
    },
};

export function ReservationApprovalsView() {
  const t = useTranslations("ReservationApprovalsView");
    const { user } = useAuth();

    const [
        requests,
        setRequests,
    ] = useState<any[]>(
        []
    );

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("all");

    const [sortBy, setSortBy] =
        useState("latest");

    const [status, setStatus] =
        useState<{
            type:
                | "success"
                | "destructive";
            message: string;
        } | null>(
            null
        );

    const fetchData =
        useCallback(
            async () => {
                setLoading(
                    true
                );

                try {
                    const [incomingRes, outgoingRes] = await Promise.all([
                        api.get("/v1/machines/reservations/incoming"),
                        api.get("/v1/machines/reservations/all")
                    ]);

                    const incoming = incomingRes.data.data || [];
                    const outgoing = outgoingRes.data.data || [];

                    // Combine and remove duplicates. Filter out completed (those live in History)
                    const combined = [...incoming];
                    outgoing.forEach((out: any) => {
                        if (!combined.find(inc => inc.id === out.id)) {
                            combined.push(out);
                        }
                    });

                    // Completed reservations belong to History, not this Transactions view
                    setRequests(combined.filter((r: any) => r.status !== 'completed'));
                } catch (
                    err
                ) {
                    console.error(
                        err
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredRequests =
        useMemo(() => {
            let data = [
                ...requests,
            ];

            if (
                search
            ) {
                const keyword =
                    search.toLowerCase();

                data =
                    data.filter(
                        (
                            req
                        ) =>
                            req.machine?.name
                                ?.toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            req.requester_umkm?.name
                                ?.toLowerCase()
                                .includes(
                                    keyword
                                ) ||
                            String(
                                req.id
                            ).includes(
                                keyword
                            )
                    );
            }

            if (
                statusFilter !==
                "all"
            ) {
                data =
                    data.filter(
                        (
                            req
                        ) =>
                            req.status ===
                            statusFilter
                    );
            }

            data.sort(
                (
                    a,
                    b
                ) => {
                    switch (
                        sortBy
                    ) {
                        case "oldest":
                            return (
                                new Date(
                                    a.created_at
                                ).getTime() -
                                new Date(
                                    b.created_at
                                ).getTime()
                            );

                        case "highest":
                            return (
                                Number(
                                    b.quoted_price ||
                                        0
                                ) -
                                Number(
                                    a.quoted_price ||
                                        0
                                )
                            );

                        default:
                            return (
                                new Date(
                                    b.created_at
                                ).getTime() -
                                new Date(
                                    a.created_at
                                ).getTime()
                            );
                    }
                }
            );

            return data;
        }, [
            requests,
            search,
            statusFilter,
            sortBy,
        ]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                
                <Loader2 className="h-8 w-8 animate-spin text-primary" />

                <p className="text-sm font-medium text-muted-foreground">
                    Memuat permintaan reservasi...
                </p>
            </div>
        );
    }

    return (
        <>
            <DashboardPageShell
                title={t("title_pusat_transaksi")}
                subtitle={t("title_kelola_dan_pantau_seluruh_transaksi_rese")}
            >
                <div className="space-y-6">
                    
                    {status && (
                        <Alert
                            variant={
                                status.type
                            }
                        >
                            <AlertDescription className="flex items-center justify-between">
                                
                                <span>
                                    {
                                        status.message
                                    }
                                </span>

                                <button
                                    onClick={() =>
                                        setStatus(
                                            null
                                        )
                                    }
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                        
                        <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
                            
                            <div className="flex items-start gap-4">

                                <div>
                                    
                                    <CardTitle className="text-xl font-bold">
                                        Daftar Transaksi
                                    </CardTitle>

                                    <CardDescription className="mt-1">
                                        Kelola seluruh reservasi mesin Anda, baik sebagai penyedia maupun penyewa.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="border-b border-border/50 p-5">
                            
                            <AdminToolbar className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                
                                <AdminSearchFilter
                                    placeholder={t("placeholder_cari_mesin_atau_umkm")}
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    containerClassName="max-w-none md:flex-1"
                                />

                                <div className="flex flex-wrap items-center gap-3">
                                    
                                    <AdminSelectFilter
                                        label={t("label_status")}
                                        value={
                                            statusFilter
                                        }
                                        onChange={
                                            setStatusFilter
                                        }
                                        options={[
                                            {
                                                value:
                                                    "all",
                                                label:
                                                    "Semua",
                                            },
                                            {
                                                value:
                                                    "pending",
                                                label:
                                                    "Pending",
                                            },
                                            {
                                                value:
                                                    "negotiating",
                                                label:
                                                    "Negosiasi",
                                            },
                                            {
                                                value:
                                                    "approved",
                                                label:
                                                    "Disetujui",
                                            },
                                        ]}
                                    />

                                    <AdminSelectFilter
                                        label={t("label_urutkan")}
                                        value={
                                            sortBy
                                        }
                                        onChange={
                                            setSortBy
                                        }
                                        options={[
                                            {
                                                value:
                                                    "latest",
                                                label:
                                                    "Terbaru",
                                            },
                                            {
                                                value:
                                                    "oldest",
                                                label:
                                                    "Terlama",
                                            },
                                            {
                                                value:
                                                    "highest",
                                                label:
                                                    "Harga tertinggi",
                                            },
                                        ]}
                                    />
                                </div>
                            </AdminToolbar>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                
                                <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium">
                                    
                                    <Search className="h-3.5 w-3.5 text-muted-foreground" />

                                    {
                                        filteredRequests.length
                                    }{" "}
                                    permintaan
                                </div>

                                {statusFilter !==
                                    "all" && (
                                    <div className="inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
                                        
                                        <Filter className="h-3.5 w-3.5" />

                                        {capitalizeLabel(
                                            statusFilter
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-0">
                            {filteredRequests.length === 0 ? (
                                <div className="p-10 text-center">
                                    <EmptyState 
                                        icon={Search}
                                        title={t("title_transaksi_tidak_ditemukan")}
                                        description={t("description_coba_gunakan_kata_kunci_lain_atau_ubah_f")}
                                    />
                                </div>
                            ) : (
                                <AdminTable>
                                    <AdminTableHeader>
                                        <AdminTableRow>
                                            <AdminTableHeadCell>{t("no_transaksi")}</AdminTableHeadCell>
                                            <AdminTableHeadCell>{t("mesin")}</AdminTableHeadCell>
                                            <AdminTableHeadCell>{t("pihak_terkait")}</AdminTableHeadCell>
                                            <AdminTableHeadCell>{t("jadwal")}</AdminTableHeadCell>
                                            <AdminTableHeadCell align="center">{t("status")}</AdminTableHeadCell>
                                            <AdminTableHeadCell align="center">{t("total_biaya")}</AdminTableHeadCell>
                                            <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                                        </AdminTableRow>
                                    </AdminTableHeader>
                                    <AdminTableBody>
                                        {filteredRequests.map((req) => {
                                            const isSuperAdmin = user?.roles?.includes('super_admin');
                                            const isAdmin = user?.roles?.includes('admin');
                                            const isUmkmOwner = user?.umkm?.id === req.machine?.owner_id && req.machine?.owner_type?.includes('Umkm');
                                            const userInstIds = user?.institutions?.map((i: any) => i.id) || [];
                                            const isInstOwner = userInstIds.includes(req.machine?.owner_id) && req.machine?.owner_type?.includes('Institution');
                                            const userOrgIds = user?.organizations?.map((o: any) => o.id) || [];
                                            const isOrgOwner = userOrgIds.includes(req.machine?.owner_id) && req.machine?.owner_type?.includes('Organization');
                                            const isOwner = isSuperAdmin || isAdmin || isUmkmOwner || isInstOwner || isOrgOwner;

                                            const dur = diffHours(req.start_time, req.end_time);
                                            const estCost = dur * (req.machine?.hourly_rate || 0);
                                            const sMap = statusMap[req.status] || { label: req.status, cls: "" };

                                            return (
                                                <AdminTableRow key={req.id}>
                                                    <AdminTableCell>
                                                        <span className="font-bold text-primary">#{req.id}</span>
                                                    </AdminTableCell>
                                                    <AdminTableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                                                                {getMachineImage(req.machine) ? (
                                                                    <img src={getMachineImage(req.machine)} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">{t("img")}</div>
                                                                )}
                                                            </div>
                                                            <span className="font-semibold line-clamp-1">{req.machine?.name}</span>
                                                        </div>
                                                    </AdminTableCell>
                                                    <AdminTableCell>
                                                        {isOwner ? (
                                                            <div className="flex flex-col">
                                                                <Badge className="w-fit mb-1 bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">{t("penyedia")}</Badge>
                                                                <span className="text-xs font-medium">{req.requester_umkm?.name || "-"}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <Badge className="w-fit mb-1 bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">{t("penyewa")}</Badge>
                                                                <span className="text-xs font-medium">
                                                                    {req.machine?.owner?.name || req.machine?.owner_name || "Workshop"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </AdminTableCell>
                                                    <AdminTableCell>
                                                        <div className="flex flex-col text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Calendar size={10} className="text-primary" /> {formatDT(req.start_time)}</span>
                                                            <span className="flex items-center gap-1"><Clock size={10} className="text-primary" /> {dur.toFixed(1)} Jam</span>
                                                        </div>
                                                    </AdminTableCell>
                                                    <AdminTableCell align="center">
                                                        <Badge className={`rounded-lg border ${sMap.cls}`}>{sMap.label}</Badge>
                                                    </AdminTableCell>
                                                    <AdminTableCell align="center">
                                                        <span className="font-bold text-primary">{formatRp(req.quoted_price || estCost)}</span>
                                                    </AdminTableCell>
                                                    <AdminTableCell align="right">
                                                        <Link href={`/workspace/reservations/approvals/${req.id}`}>
                                                            <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1">
                                                                <Eye size={14} /> Detail
                                                            </Button>
                                                        </Link>
                                                    </AdminTableCell>
                                                </AdminTableRow>
                                            );
                                        })}
                                    </AdminTableBody>
                                </AdminTable>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DashboardPageShell>
        </>
    );
}