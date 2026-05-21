"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import api from "@/src/lib/http/axios";

import {
  Loader2,
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  X,
  CircleDollarSign,
  FileText,
  CreditCard,
  Search,
  Filter,
  Boxes,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
  Alert,
  AlertDescription,
} from "@/src/components/ui/alert";

import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";

import {
  Card,
  CardContent,
} from "@/src/components/ui/card";

import { Badge } from "@/src/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

import { Separator } from "@/src/components/ui/separator";

import { useRouter } from "@/src/i18n/navigation";

import {
  AdminToolbar,
  AdminSearchFilter,
  AdminSelectFilter,
} from "@/src/components/ui/dashboard/AdminDataView";

function calcDurationHours(
  start: string,
  end: string
): number {
  if (!start || !end)
    return 0;

  const diff =
    (new Date(end).getTime() -
      new Date(start).getTime()) /
    3600000;

  return Math.max(0, diff);
}

function formatDT(
  dtStr: string
) {
  if (!dtStr) return "-";

  const d = new Date(dtStr);

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

import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTranslations } from "next-intl";

/** Check if the logged-in user owns a machine (UMKM / Institution / Organization) */
function useIsMine() {
  const { user } = useAuth();
  return (machine: any): boolean => {
    if (!user || !machine) return false;
    const ownerId   = machine.owner_id;
    const ownerType = machine.owner_entity_type || machine.owner_type || "";

    // UMKM owner
    if (ownerType.toLowerCase().includes("umkm") && user.umkm?.id === ownerId) return true;
    // Institution owner
    if (ownerType.toLowerCase().includes("institution") && user.institutions?.some((i: any) => i.id === ownerId)) return true;
    // Organization owner (UPT)
    if (ownerType.toLowerCase().includes("organization") && user.organizations?.some((o: any) => o.id === ownerId)) return true;
    return false;
  };
}

export function ReservationsView() {
  const t = useTranslations("ReservationsView");
  const { user } = useAuth();
  const isMineOf = useIsMine();
  const router = useRouter();

  const [machines, setMachines] =
    useState<any[]>([]);

  const [
    myReservations,
    setMyReservations,
  ] = useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState("latest");

  const [submitting, setSubmitting] =
    useState(false);

  const [status, setStatus] =
    useState<{
      type:
        | "success"
        | "destructive";
      message: string;
    } | null>(null);

  const [
    paymentDialogOpen,
    setPaymentDialogOpen,
  ] = useState(false);

  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState<any>(null);

  const [paymentFile, setPaymentFile] =
    useState<File | null>(null);

  const [
    paymentForm,
    setPaymentForm,
  ] = useState({
    payment_method:
      "xendit",
    payment_notes: "",
  });

  const paymentFileRef =
    useRef<HTMLInputElement>(
      null
    );

  const fetchData =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
          machRes,
          resRes,
        ] =
          await Promise.all([
            api.get(
              "/v1/machines?is_reservable=1&condition=good"
            ),
            api.get(
              "/v1/machines/reservations/all"
            ),
          ]);

        setMachines(
          machRes.data.data ||
            []
        );

        setMyReservations(
          resRes.data.data || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const machineTypes =
    useMemo(() => {
      return [
        "all",
        ...Array.from(
          new Set(
            machines
              .map(
                (m) => m.type
              )
              .filter(Boolean)
          )
        ),
      ];
    }, [machines]);

  const filteredMachines =
    useMemo(() => {
      let data = [...machines];

      if (search) {
        const keyword =
          search.toLowerCase();

        data = data.filter(
          (m) =>
            m.name
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            m.owner?.name
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            m.owner?.company_name
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            m.type
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            m.location
              ?.toLowerCase()
              .includes(
                keyword
              )
        );
      }

      if (
        typeFilter !== "all"
      ) {
        data = data.filter(
          (m) =>
            String(
              m.type
            ) ===
            String(
              typeFilter
            )
        );
      }

      data.sort((a, b) => {
        switch (sortBy) {
          case "price-high":
            return (
              (b.hourly_rate ||
                0) -
              (a.hourly_rate ||
                0)
            );

          case "price-low":
            return (
              (a.hourly_rate ||
                0) -
              (b.hourly_rate ||
                0)
            );

          case "name":
            return String(
              a.name
            ).localeCompare(
              String(b.name)
            );

          default:
            return (
              b.id - a.id
            );
        }
      });

      return data;
    }, [
      machines,
      search,
      typeFilter,
      sortBy,
    ]);

  const handleSubmitPayment =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setSubmitting(true);

      try {
        if (paymentForm.payment_method === "xendit") {
          const res = await api.post(`/v1/machines/reservations/${selectedReservation.id}/create-payment`);
          const invoiceUrl = res.data?.data?.invoice_url;
          if (invoiceUrl) {
            window.location.href = invoiceUrl;
            return;
          }
          throw new Error("Gagal mendapatkan link pembayaran");
        } else {
          const fd = new FormData();
          fd.append("payment_method", paymentForm.payment_method);
          fd.append("payment_notes", paymentForm.payment_notes);
          if (paymentFile) {
            fd.append("proof_file", paymentFile);
          }
          await api.post(`/v1/machines/reservations/${selectedReservation.id}/payment`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setStatus({ type: "success", message: "Bukti pembayaran berhasil dikirim." });
          setPaymentDialogOpen(false);
          fetchData();
        }
      } catch (err: any) {
        setStatus({
          type:
            "destructive",
          message:
            err.response?.data
              ?.message ||
            "Gagal mengirim pembayaran.",
        });
      } finally {
        setSubmitting(false);
      }
    };

  const getStatusBadge = (
    s: string
  ) => {
    switch (s) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="rounded-lg"
          >
            Menunggu
          </Badge>
        );

      case "approved":
        return (
          <Badge className="rounded-lg border-success/20 bg-success/10 text-success">
            Disetujui
          </Badge>
        );

      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="rounded-lg"
          >
            Ditolak
          </Badge>
        );

      default:
        return (
          <Badge
            variant="outline"
            className="rounded-lg"
          >
            {s}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p className="text-sm text-muted-foreground">
          Memuat data mesin...
        </p>
      </div>
    );
  }

  return (
    <DashboardPageShell
      title={t("title_reservasi_permesinan")}
      subtitle={t("title_kelola_peminjaman_fasilitas_produksi")}
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          
          <div className="space-y-6 xl:col-span-8">
            
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              
              <div className="border-b border-border/50 bg-muted/10 px-6 py-5">
                
                <div className="flex items-center gap-4">

                  <div>
                    
                    <h2 className="text-xl font-bold">
                      Katalog Mesin
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Pilih mesin sesuai kebutuhan produksi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-border/50 p-5">
                
                <AdminToolbar className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  
                  <AdminSearchFilter
                    placeholder="Cari mesin, pemilik (PT/UMKM), tipe..."
                    value={search}
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
                      label={t("label_tipe")}
                      value={
                        typeFilter
                      }
                      onChange={
                        setTypeFilter
                      }
                      options={machineTypes.map(
                        (
                          type
                        ) => ({
                          value:
                            type,
                          label:
                            type ===
                            "all"
                              ? "Semua"
                              : type,
                        })
                      )}
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
                            "name",
                          label:
                            "Nama",
                        },
                        {
                          value:
                            "price-high",
                          label:
                            "Harga Tinggi",
                        },
                        {
                          value:
                            "price-low",
                          label:
                            "Harga Rendah",
                        },
                      ]}
                    />
                  </div>
                </AdminToolbar>
              </div>

              <div className="p-6">
                
                {filteredMachines.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-border/50 py-20 text-center">
                    
                    <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/20" />

                    <p className="text-sm text-muted-foreground">
                      Mesin tidak ditemukan.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {filteredMachines.map((machine) => {
                      const isMine = isMineOf(machine);
                      return (
                        <div
                          key={machine.id}
                          className={`overflow-hidden rounded-2xl border bg-card transition-all ${
                            isMine
                              ? "border-primary/40"
                              : "border-border/50 hover:border-primary/20"
                          }`}
                        >
                          {/* Image */}
                          <div className="relative h-64 overflow-hidden bg-muted/20">
                            {machine.image_url || machine.image ? (
                              <img
                                src={machine.image_url || machine.image}
                                alt={machine.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Wrench className="h-12 w-12 text-muted-foreground/20" />
                              </div>
                            )}
                            {/* Mesin Saya badge */}
                            {isMine && (
                              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-4">
                                <span className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                  <Boxes className="h-3.5 w-3.5" />
                                  Mesin Saya
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-5 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                  <Badge variant="outline" className="rounded-lg">{machine.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{machine.code}</span>
                                </div>
                                <h3 className="line-clamp-2 text-lg font-bold">{machine.name}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] text-muted-foreground">{t("sewa_jam")}</p>
                                <p className="text-lg font-bold text-primary">{formatRp(machine.hourly_rate)}</p>
                              </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
                                {machine.owner?.logo_url ? (
                                  <img src={machine.owner.logo_url} alt={t("alt_owner")} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
                                    {machine.owner?.name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                  {isMine ? "Kepemilikan" : "Penyedia"}
                                </p>
                                <p className="truncate text-sm font-semibold">
                                  {isMine ? "Milik Anda" : (machine.owner?.name || "Workshop")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              {machine.location || "Workshop"}
                            </div>

                            {isMine ? (
                              <>
                                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                                  <Boxes className="h-4 w-4 shrink-0 text-primary" />
                                  <p className="text-xs font-semibold text-primary">
                                    Ini adalah mesin milik Anda — tidak dapat direservasi sendiri.
                                  </p>
                                </div>
                                <Button
                                  disabled
                                  variant="outline"
                                  className="h-11 w-full cursor-not-allowed rounded-xl border-primary/30 font-semibold text-primary/50"
                                >
                                  Mesin Milik Anda
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => router.push(`/workspace/reservations/${machine.id}`)}
                                className="h-11 w-full rounded-xl font-semibold"
                              >
                                Detail Mesin
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Right Sidebar: Role-aware Stats + My Reservations */}
          <div className="space-y-6 xl:col-span-4">

            {/* Role-aware Reservation Stats */}
            {(() => {
              const myBookings = myReservations.filter(r => !isMineOf(r.machine));
              const incomingBookings = myReservations.filter(r => isMineOf(r.machine));
              const myPaid = myBookings.filter(r => r.status === 'completed' && r.payment_status === 'paid');
              const incomingPaid = incomingBookings.filter(r => r.status === 'completed' && r.payment_status === 'paid');
              const pengeluaran = myPaid.reduce((s, r) => s + (r.quoted_price || 0), 0);
              const pemasukan = incomingPaid.reduce((s, r) => s + (r.quoted_price || 0), 0);
              const hasBothRoles = myBookings.length > 0 && incomingBookings.length > 0;

              return (
                <>
                  {/* Financial Summary */}
                  {(pengeluaran > 0 || pemasukan > 0) && (
                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                      <div className="border-b border-border/50 bg-muted/10 px-5 py-4">
                        <h2 className="text-lg font-bold">Ringkasan Keuangan</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Dari transaksi reservasi selesai &amp; lunas</p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-success/5 border border-success/20 p-4">
                          <p className="text-[10px] font-bold text-success">Pemasukan</p>
                          <p className="text-lg font-black text-success mt-1">{formatRp(pemasukan)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{incomingPaid.length} transaksi</p>
                        </div>
                        <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                          <p className="text-[10px] font-bold text-destructive">Pengeluaran</p>
                          <p className="text-lg font-black text-destructive mt-1">{formatRp(pengeluaran)}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{myPaid.length} transaksi</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* As Renter */}
                  {(myBookings.length > 0 || !hasBothRoles) && (
                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                      <div className="border-b border-border/50 bg-muted/10 px-5 py-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold">Sebagai Pereservasi</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Mesin yang Anda sewa</p>
                        </div>
                        <button
                          className="text-xs font-semibold text-primary hover:underline"
                          onClick={() => router.push('/workspace/reservations/history')}
                        >Lihat Riwayat →</button>
                      </div>
                      <div className="p-4 space-y-3">
                        {/* Stats pills */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-muted/20 p-2.5 text-center">
                            <p className="text-xl font-black">{myBookings.length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Total</p>
                          </div>
                          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-center">
                            <p className="text-xl font-black text-emerald-600">{myBookings.filter(r => r.status === 'completed').length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Selesai</p>
                          </div>
                          <div className="rounded-xl bg-yellow-400/10 p-2.5 text-center">
                            <p className="text-xl font-black text-yellow-600">{myBookings.filter(r => r.status === 'pending' || r.status === 'approved').length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Aktif</p>
                          </div>
                        </div>

                        {/* Recent renter bookings needing payment */}
                        {myBookings.filter(r => r.status === 'approved' && r.payment_status !== 'paid' && r.payment_status !== 'awaiting_confirmation').length > 0 && (
                          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                            <p className="text-xs font-bold text-destructive mb-2">Menunggu Pembayaran</p>
                            {myBookings.filter(r => r.status === 'approved' && r.payment_status !== 'paid' && r.payment_status !== 'awaiting_confirmation').slice(0, 2).map(res => (
                              <div key={res.id} className="flex items-center justify-between py-1.5">
                                <p className="text-xs font-medium truncate max-w-[110px]">{res.machine?.name}</p>
                                <Button size="sm" className="h-7 rounded-lg text-[11px] font-bold px-3 bg-success hover:bg-success/90"
                                  onClick={() => { setSelectedReservation(res); setPaymentDialogOpen(true); }}>
                                  Bayar
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {myBookings.length === 0 && (
                          <div className="py-6 text-center">
                            <CircleDollarSign className="mx-auto h-7 w-7 text-muted-foreground/20 mb-2" />
                            <p className="text-sm text-muted-foreground">Belum ada reservasi.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* As Provider */}
                  {incomingBookings.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card">
                      <div className="border-b border-primary/10 bg-primary/5 px-5 py-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-primary">Sebagai Penyedia</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Permintaan masuk ke mesin Anda</p>
                        </div>
                        <button
                          className="text-xs font-semibold text-primary hover:underline"
                          onClick={() => router.push('/workspace/reservations/approvals')}
                        >Kelola →</button>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-muted/20 p-2.5 text-center">
                            <p className="text-xl font-black">{incomingBookings.length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Total</p>
                          </div>
                          <div className="rounded-xl bg-yellow-400/10 p-2.5 text-center">
                            <p className="text-xl font-black text-yellow-600">{incomingBookings.filter(r => r.status === 'pending').length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Menunggu</p>
                          </div>
                          <div className="rounded-xl bg-blue-500/10 p-2.5 text-center">
                            <p className="text-xl font-black text-blue-600">{incomingBookings.filter(r => r.payment_status === 'awaiting_confirmation').length}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">Bayar Masuk</p>
                          </div>
                        </div>

                        {/* Pending confirmations shortcut */}
                        {incomingBookings.filter(r => r.status === 'pending').length > 0 && (
                          <button
                            className="w-full flex items-center justify-between rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-left hover:bg-yellow-500/20 transition-colors"
                            onClick={() => router.push('/workspace/reservations/approvals')}
                          >
                            <div>
                              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Perlu Persetujuan</p>
                              <p className="text-[11px] text-muted-foreground">{incomingBookings.filter(r => r.status === 'pending').length} permintaan menunggu</p>
                            </div>
                            <span className="text-yellow-600 text-sm">→</span>
                          </button>
                        )}

                        {incomingBookings.filter(r => r.payment_status === 'awaiting_confirmation').length > 0 && (
                          <button
                            className="w-full flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-left hover:bg-primary/10 transition-colors"
                            onClick={() => router.push('/workspace/reservations/approvals')}
                          >
                            <div>
                              <p className="text-xs font-bold text-primary">Konfirmasi Pembayaran</p>
                              <p className="text-[11px] text-muted-foreground">{incomingBookings.filter(r => r.payment_status === 'awaiting_confirmation').length} menunggu konfirmasi</p>
                            </div>
                            <span className="text-primary text-sm">→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>



      <Dialog
        open={paymentDialogOpen}
        onOpenChange={
          setPaymentDialogOpen
        }
      >
        <DialogContent className="overflow-hidden rounded-2xl border border-border/50 bg-card p-0 sm:max-w-md">
          
          <DialogHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
            
            <DialogTitle className="text-xl font-bold">
              Pembayaran
            </DialogTitle>

            <DialogDescription>
              Upload bukti pembayaran reservasi mesin.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={
              handleSubmitPayment
            }
            className="space-y-5 p-6"
          >
            
            <div className="space-y-2">
              
              <Label>
                Metode Pembayaran
              </Label>

              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="xendit">Online Payment (Xendit)</option>
                <option value="transfer">Transfer Manual</option>
                <option value="cash">Cash</option>
                <option value="qris">QRIS Manual</option>
              </select>
            </div>

            {paymentForm.payment_method !== "xendit" && (
              <div className="space-y-2">
                <Label>Bukti Pembayaran</Label>
                <div
                  onClick={() => paymentFileRef.current?.click()}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-4"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="flex-1 truncate text-sm text-muted-foreground">
                    {paymentFile ? paymentFile.name : "Upload file pembayaran"}
                  </p>
                </div>
                <input
                  ref={paymentFileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Input
                value={paymentForm.payment_notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_notes: e.target.value })}
                placeholder="Contoh: Pembayaran mesin A"
                className="h-11 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl font-semibold"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {paymentForm.payment_method === "xendit" ? "Bayar via Xendit" : "Kirim Pembayaran"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}