"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import api from "@/src/lib/http/axios";

import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Clock,
  ChevronRight,
  CircleDollarSign,
  Wrench,
  MessageCircle,
  Send,
  Search,
  BadgeCheck,
  TimerReset,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";

import { Button } from "@/src/components/ui/button";

import { Badge } from "@/src/components/ui/badge";

import {
  Alert,
  AlertDescription,
} from "@/src/components/ui/alert";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Input } from "@/src/components/ui/input";

import { useRouter } from "@/src/i18n/navigation";

import {
  AdminToolbar,
  AdminSearchFilter,
  AdminSelectFilter,
  AdminPagination,
} from "@/src/components/ui/dashboard/AdminDataView";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";

import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { useTranslations } from "next-intl";

function formatDT(
  dtStr: string
) {
  if (!dtStr)
    return "-";

  const d =
    new Date(dtStr);

  return (
    d.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ) +
    ", " +
    d.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )
  );
}

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

function calcDurationHours(
  start: string,
  end: string
): number {
  if (
    !start ||
    !end
  )
    return 0;

  const diff =
    (
      new Date(
        end
      ).getTime() -
      new Date(
        start
      ).getTime()
    ) / 3600000;

  return Math.max(
    0,
    diff
  );
}

const getMachineImage =
  (
    machine: any
  ) => {
    if (!machine)
      return null;

    const candidates =
      [
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
      machine.images
        .length > 0
    ) {
      const first =
        machine
          .images[0];

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

export function ReservationHistoryView() {
  const t = useTranslations("ReservationHistoryView");
  const router =
    useRouter();

  const [history, setHistory] =
    useState<any[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [status, setStatus] =
    useState<{
      type:
        | "success"
        | "destructive";
      message: string;
    } | null>(
      null
    );

  const [
    currentUser,
    setCurrentUser,
  ] = useState<any>(
    null
  );

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState("latest");

  const [
    negotiationDialogOpen,
    setNegotiationDialogOpen,
  ] = useState(false);

  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState<any>(
    null
  );

  const fetchData =
    useCallback(
      async (
        page: number
      ) => {
        setLoading(
          true
        );

        try {
          const [
            res,
            userRes,
          ] =
            await Promise.all(
              [
                api.get(
                  `/v1/machines/reservations/history?page=${page}`
                ),
                api.get(
                  "/v1/me"
                ),
              ]
            );

          setHistory(
            res.data
              .data ||
              []
          );

          setTotalPages(
            res.data.meta
              ?.last_page ||
              1
          );

          setCurrentPage(
            res.data.meta
              ?.current_page ||
              1
          );

          setCurrentUser(
            userRes
              .data
              .data
              ?.user ||
              userRes
                .data
                .user
          );
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
    fetchData(1);
  }, [fetchData]);

  const filteredHistory =
    useMemo(() => {
      let data = [
        ...history,
      ];

      if (search) {
        const keyword =
          search.toLowerCase();

        data =
          data.filter(
            (
              item
            ) =>
              item.machine?.name
                ?.toLowerCase()
                .includes(
                  keyword
                ) ||
              item.machine?.owner_name
                ?.toLowerCase()
                .includes(
                  keyword
                ) ||
              String(
                item.id
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
              item
            ) =>
              item.status ===
              statusFilter
          );
      }

      if (
        paymentFilter !==
        "all"
      ) {
        data =
          data.filter(
            (
              item
            ) =>
              item.payment_status ===
              paymentFilter
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

            case "lowest":
              return (
                Number(
                  a.quoted_price ||
                    0
                ) -
                Number(
                  b.quoted_price ||
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
      history,
      search,
      statusFilter,
      paymentFilter,
      sortBy,
    ]);

  // Statistics Calculation
  const stats = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    let asProvider = 0;
    let asReserver = 0;
    
    let statusCounts = { pending: 0, negotiating: 0, approved: 0, completed: 0, rejected: 0 };

    history.forEach(item => {
        let isProvider = false;
        if (currentUser && item.machine) {
            const ownerId = item.machine.owner_id;
            const ownerType = item.machine.owner_entity_type || item.machine.owner_type || "";
            if (ownerType.toLowerCase().includes("umkm") && currentUser.umkm?.id === ownerId) isProvider = true;
            if (ownerType.toLowerCase().includes("institution") && currentUser.institutions?.some((i: any) => i.id === ownerId)) isProvider = true;
            if (ownerType.toLowerCase().includes("organization") && currentUser.organizations?.some((o: any) => o.id === ownerId)) isProvider = true;
        }
        // Ideally we use a robust check, but for now we assume if user_id == currentUser.id they are reserver
        const isReserver = currentUser && item.user_id === currentUser.id;

        if (isProvider) {
            asProvider++;
            if (item.status === 'completed' || item.payment_status === 'paid') {
                totalIncome += Number(item.quoted_price || 0);
            }
        } else {
            asReserver++;
            if (item.status === 'completed' || item.payment_status === 'paid') {
                totalExpense += Number(item.quoted_price || 0);
            }
        }

        if (statusCounts[item.status as keyof typeof statusCounts] !== undefined) {
            statusCounts[item.status as keyof typeof statusCounts]++;
        }
    });

    return { totalExpense, totalIncome, asProvider, asReserver, statusCounts };
  }, [history, currentUser]);

  const pieData = useMemo(() => {
      const data = [
          { name: "Menunggu", value: stats.statusCounts.pending, color: "#64748b" },
          { name: "Negosiasi", value: stats.statusCounts.negotiating, color: "#8b5cf6" },
          { name: "Disetujui", value: stats.statusCounts.approved, color: "#10b981" },
          { name: "Selesai", value: stats.statusCounts.completed, color: "#3b82f6" },
          { name: "Ditolak", value: stats.statusCounts.rejected, color: "#ef4444" },
      ].filter(d => d.value > 0);
      return data;
  }, [stats]);

  const getStatusBadge =
    (
      s: string
    ) => {
      switch (
        s
      ) {
        case "pending":
          return (
            <Badge
              variant="secondary"
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              Menunggu
            </Badge>
          );

        case "negotiating":
          return (
            <Badge className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Negosiasi
            </Badge>
          );

        case "approved":
          return (
            <Badge className="rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              Disetujui
            </Badge>
          );

        case "completed":
          return (
            <Badge className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500">
              Selesai
            </Badge>
          );

        case "rejected":
          return (
            <Badge
              variant="destructive"
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              Ditolak
            </Badge>
          );

        default:
          return (
            <Badge
              variant="outline"
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              {
                s
              }
            </Badge>
          );
      }
    };

  const getPaymentBadge =
    (
      s: string
    ) => {
      switch (
        s
      ) {
        case "paid":
          return (
            <Badge className="rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              Lunas
            </Badge>
          );

        case "awaiting_confirmation":
          return (
            <Badge className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              Menunggu Konfirmasi
            </Badge>
          );

        default:
          return (
            <Badge
              variant="outline"
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              Belum Bayar
            </Badge>
          );
      }
    };

  if (
    loading &&
    history.length ===
      0
  ) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p className="text-sm font-medium text-muted-foreground">
          Memuat Riwayat Reservasi...
        </p>
      </div>
    );
  }

  return (
    <DashboardPageShell
      title={t("title_riwayat_reservasi")}
      subtitle={t("title_daftar_transaksi_dan_aktivitas_reservasi")}
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          
          <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
            
            <div>
              
              <CardTitle className="text-xl font-bold">
                Riwayat Reservasi
              </CardTitle>

              <CardDescription className="mt-1 text-sm">
                Monitoring seluruh aktivitas reservasi mesin industri.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="border-b border-border/50 p-5">
            
            <AdminToolbar className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              
              <AdminSearchFilter
                placeholder={t("placeholder_cari_mesin_atau_id_reservasi")}
                value={
                  search
                }
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target
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
                        "approved",
                      label:
                        "Disetujui",
                    },
                    {
                      value:
                        "completed",
                      label:
                        "Selesai",
                    },
                  ]}
                />

                <AdminSelectFilter
                  label={t("label_pembayaran")}
                  value={
                    paymentFilter
                  }
                  onChange={
                    setPaymentFilter
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
                        "paid",
                      label:
                        "Lunas",
                    },
                    {
                      value:
                        "unpaid",
                      label:
                        "Belum Bayar",
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
                        "Harga Tertinggi",
                    },
                    {
                      value:
                        "lowest",
                      label:
                        "Harga Terendah",
                    },
                  ]}
                />
              </div>
            </AdminToolbar>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium">
                
                <Search className="h-3.5 w-3.5 text-muted-foreground" />

                {
                  filteredHistory.length
                }{" "}
                Reservasi
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-success/10 bg-success/5 px-3 py-2 text-xs font-medium text-success">
                
                <BadgeCheck className="h-3.5 w-3.5" />

                {
                  filteredHistory.filter(
                    (
                      r
                    ) =>
                      r.status ===
                      "completed"
                  ).length
                }{" "}
                Selesai
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-3 py-2 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                
                <TimerReset className="h-3.5 w-3.5" />

                {
                  filteredHistory.filter(
                    (
                      r
                    ) =>
                      r.status ===
                      "pending"
                  ).length
                }{" "}
                Pending
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            
            {filteredHistory.length ===
            0 ? (
              <div className="p-10">
                
                <EmptyState
                  icon={
                    Search
                  }
                  title={t("title_data_tidak_ditemukan")}
                  description={t("description_tidak_ada_data_reservasi")}
                />
              </div>
            ) : (
              <AdminTable>
                
                <AdminTableHeader>
                  
                  <AdminTableRow>
                    
                    <AdminTableHeadCell>
                      Mesin
                    </AdminTableHeadCell>

                    <AdminTableHeadCell>
                      Jadwal
                    </AdminTableHeadCell>

                    <AdminTableHeadCell align="center">
                      Status
                    </AdminTableHeadCell>

                    <AdminTableHeadCell align="center">
                      Pembayaran
                    </AdminTableHeadCell>

                    <AdminTableHeadCell align="center">
                      Biaya
                    </AdminTableHeadCell>

                    <AdminTableHeadCell align="right">
                      Aksi
                    </AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>

                <AdminTableBody>
                  
                  {filteredHistory.map(
                    (
                      item
                    ) => (
                      <AdminTableRow
                        key={
                          item.id
                        }
                      >
                        
                        <AdminTableCell>
                          
                          <div className="flex items-center gap-4">
                            
                            <div className="h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                              
                              {getMachineImage(
                                item.machine
                              ) ? (
                                <img
                                  src={getMachineImage(
                                    item.machine
                                  )}
                                  alt={
                                    item
                                      .machine
                                      ?.name
                                  }
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30">
                                  
                                  <Wrench className="h-6 w-6 text-muted-foreground/30" />

                                  <span className="mt-2 text-[11px] font-medium text-muted-foreground">
                                    Tidak Ada Foto
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              
                              <p className="line-clamp-2 text-sm leading-snug font-semibold">
                                {
                                  item
                                    .machine
                                    ?.name
                                }
                              </p>

                              <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {item
                                  .machine
                                  ?.owner_name ||
                                  "Workshop"}
                              </p>

                              <p className="mt-2 text-xs text-muted-foreground">
                                ID #
                                {
                                  item.id
                                }
                              </p>
                            </div>
                          </div>
                        </AdminTableCell>

                        <AdminTableCell>
                          
                          <div className="space-y-2 text-xs">
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              
                              <Calendar className="h-3.5 w-3.5 text-primary" />

                              {formatDT(
                                item.start_time
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              
                              <Clock className="h-3.5 w-3.5 text-primary" />

                              {formatDT(
                                item.end_time
                              )}
                            </div>
                          </div>
                        </AdminTableCell>

                        <AdminTableCell align="center">
                          {getStatusBadge(
                            item.status
                          )}
                        </AdminTableCell>

                        <AdminTableCell align="center">
                          {getPaymentBadge(
                            item.payment_status
                          )}
                        </AdminTableCell>

                        <AdminTableCell align="center">
                          
                          <div className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs font-semibold">
                            
                            <CircleDollarSign className="h-3.5 w-3.5 text-primary" />

                            {formatRp(
                              item.quoted_price ||
                                calcDurationHours(
                                  item.start_time,
                                  item.end_time
                                ) *
                                  (item
                                    .machine
                                    ?.hourly_rate ||
                                    0)
                            )}
                          </div>
                        </AdminTableCell>

                        <AdminTableCell align="right">
                          
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-xl border-border/50 px-4 font-medium"
                              onClick={() =>
                                router.push(
                                  `/workspace/reservations/history/${item.id}`
                                )
                              }
                            >
                              Detail

                              <ChevronRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </AdminTableCell>
                      </AdminTableRow>
                    )
                  )}
                </AdminTableBody>
              </AdminTable>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="border-t border-border/50 p-4">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={Array.from({ length: totalPages }, (_, i) => i + 1)}
              onPageChange={(page) => fetchData(page)}
            />
          </div>
        )}
      </div>

      {/* Sidebar Stats */}
      <div className="xl:col-span-1 space-y-6">
          <Card className="rounded-2xl border border-border/50 shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 px-6 py-5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <PieChartIcon size={18} /> Ringkasan Statistik
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                  {/* Financials based on role */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                          <p className="text-[10px] font-bold text-success tracking-wider">TOTAL PENDAPATAN</p>
                          <p className="text-lg font-black text-success mt-1">{formatRp(stats.totalIncome)}</p>
                          <p className="text-[10px] text-success/80 mt-1">{stats.asProvider} Reservasi Masuk</p>
                      </div>
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                          <p className="text-[10px] font-bold text-destructive tracking-wider">TOTAL PENGELUARAN</p>
                          <p className="text-lg font-black text-destructive mt-1">{formatRp(stats.totalExpense)}</p>
                          <p className="text-[10px] text-destructive/80 mt-1">{stats.asReserver} Reservasi Keluar</p>
                      </div>
                  </div>
                  
                  {/* Status Chart */}
                  <div className="pt-2">
                      <p className="text-xs font-bold text-muted-foreground tracking-wider mb-4">DISTRIBUSI STATUS</p>
                      {pieData.length > 0 ? (
                          <div className="h-[200px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={pieData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={50}
                                          outerRadius={80}
                                          paddingAngle={2}
                                          dataKey="value"
                                      >
                                          {pieData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                      </Pie>
                                      <RechartsTooltip 
                                          contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12, fontWeight: 'bold' }}
                                      />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                      ) : (
                          <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                              <p className="text-xs text-muted-foreground italic">Belum ada data reservasi</p>
                          </div>
                      )}
                      
                      {/* Legend */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                          {pieData.map((d, i) => (
                              <div key={i} className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                  <span className="text-xs font-medium text-foreground">{d.name} <span className="text-muted-foreground">({d.value})</span></span>
                              </div>
                          ))}
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>
      </div>
      </div>
    </DashboardPageShell>
  );
}