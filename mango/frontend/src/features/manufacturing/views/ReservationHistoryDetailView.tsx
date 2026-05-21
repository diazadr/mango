"use client";

import {
    useState,
    useEffect,
    useCallback,
    useRef,
    use
} from "react";

import api from "@/src/lib/http/axios";

import { useRouter } from "@/src/i18n/navigation";

import {
    Loader2,
    Calendar,
    Clock,
    ArrowLeft,
    CheckCircle2,
    FileText,
    CircleDollarSign,
    Check,
    XCircle,
    CreditCard,
    History,
    AlertCircle,
    MapPin,
} from "lucide-react";

import { setBreadcrumbLabel } from "@/src/components/layouts/dashboard/navbar/NavBreadcrumbs";

import { Button } from "@/src/components/ui/button";

import { Badge } from "@/src/components/ui/badge";

import { Separator } from "@/src/components/ui/separator";

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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

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
                year: "numeric"
            }
        ) +
        " · " +
        d.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit"
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

        case "negotiating":
            return (
                <Badge className="rounded-lg border-primary/20 bg-primary/10 text-primary">
                    Negosiasi
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

        case "completed":
            return (
                <Badge className="rounded-lg border-blue-500/20 bg-blue-500/10 text-blue-500">
                    Selesai
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

const getPaymentBadge = (
    s: string
) => {
    switch (s) {
        case "awaiting_confirmation":
            return (
                <Badge className="rounded-lg border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    Menunggu Konfirmasi
                </Badge>
            );

        case "paid":
            return (
                <Badge className="rounded-lg border-success/20 bg-success/10 text-success">
                    Lunas
                </Badge>
            );

        default:
            return (
                <Badge
                    variant="outline"
                    className="rounded-lg"
                >
                    Belum Bayar
                </Badge>
            );
    }
};

import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTranslations } from "next-intl";

export function ReservationHistoryDetailView({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
  const t = useTranslations("ReservationHistoryDetailView");
    const { id } =
        use(params);

    const { user } = useAuth();

    const router =
        useRouter();

    const [
        reservation,
        setReservation
    ] = useState<any>(
        null
    );

    const [loading, setLoading] =
        useState(true);

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [paymentForm, setPaymentForm] = useState({ payment_method: "xendit", payment_notes: "" });
    const [submitting, setSubmitting] = useState(false);
    const [payStatus, setPayStatus] = useState<{ type: 'success' | 'destructive'; message: string } | null>(null);
    const paymentFileRef = useRef<HTMLInputElement>(null);

    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            const res = await api.get(`/v1/machines/reservations/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (e) {
            console.error("Failed to download PDF", e);
        } finally {
            setDownloadingPdf(false);
        }
    };

    const fetchData =
        useCallback(async () => {
            setLoading(true);

            try {
                const res =
                    await api.get(
                        `/v1/machines/reservations/${id}`
                    );

                setReservation(
                    res.data.data
                );
            } catch (err) {
                console.error(
                    err
                );

                router.push(
                    "/workspace/reservations/history"
                );
            } finally {
                setLoading(
                    false
                );
            }
        }, [id, router]);

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (paymentForm.payment_method === "xendit") {
                const res = await api.post(`/v1/machines/reservations/${id}/create-payment`);
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
                if (paymentFile) fd.append("proof_file", paymentFile);
                await api.post(`/v1/machines/reservations/${id}/payment`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                setPayStatus({ type: "success", message: "Bukti pembayaran berhasil dikirim. Menunggu konfirmasi penyedia." });
                setPaymentDialogOpen(false);
                fetchData();
            }
        } catch (err: any) {
            setPayStatus({ type: "destructive", message: err.response?.data?.message || "Gagal mengirim pembayaran." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleXenditPayment = async () => {
        setSubmitting(true);
        try {
            const res = await api.post(`/v1/machines/reservations/${id}/create-payment`);
            if (res.data.data?.invoice_url) {
                window.location.href = res.data.data.invoice_url;
            } else {
                setPayStatus({ type: "destructive", message: "Gagal memuat halaman pembayaran." });
            }
        } catch (err: any) {
            setPayStatus({ type: "destructive", message: err.response?.data?.message || "Gagal membuat invoice pembayaran online." });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Set breadcrumb label to machine name after data loads
    useEffect(() => {
        if (reservation?.machine?.name && id) {
            setBreadcrumbLabel(String(id), reservation.machine.name);
        }
    }, [reservation, id]);

    if (loading) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
                
                <Loader2 className="h-8 w-8 animate-spin text-primary" />

                <p className="text-sm font-medium text-muted-foreground">
                    Memuat Detail Reservasi...
                </p>
            </div>
        );
    }

    if (!reservation)
        return null;

    const durationHours =
        calcDurationHours(
            reservation.start_time,
            reservation.end_time
        );

    const initialPrice = durationHours * (reservation.machine?.hourly_rate || 0);
    const finalPrice = reservation.quoted_price || initialPrice;

// 5-step lifecycle timeline
const steps = [
    {
        key: "submitted",
        label: "Pengajuan",
        icon: FileText,
    },
    {
        key: "negotiating",
        label: "Negosiasi Harga",
        icon: History,
    },
    {
        key: "approved",
        label: "Persetujuan",
        icon: CheckCircle2,
    },
    {
        key: "payment",
        label: "Pembayaran",
        icon: CreditCard,
    },
    {
        key: "completed",
        label: "Selesai",
        icon: Check,
    },
];

    const hasNegotiation = (reservation.negotiations?.length ?? 0) > 0;

    // Current step index (0-based, matching steps array above)
    let currentStep = 1; // always at least "submitted"
    if (hasNegotiation || reservation.status === "negotiating") currentStep = 2;
    if (reservation.status === "approved" || reservation.status === "completed") currentStep = 3;
    if (reservation.status === "approved" && reservation.payment_status !== "unpaid") currentStep = 4;
    if (reservation.status === "completed" && reservation.payment_status === "paid") currentStep = 5;

    // Timestamps
    const approvedAt = reservation.approvals?.[0]?.created_at 
        ?? reservation.approvals?.find((a: any) => a.created_at)?.created_at
        ?? (reservation.status === 'approved' || reservation.status === 'completed' ? reservation.updated_at : null);
    const paidAt = reservation.paid_at ?? null;

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                
                <Button
                    variant="outline"
                    className="h-11 w-fit rounded-xl border-border/50 px-5 font-semibold"
                    onClick={() =>
                        router.back()
                    }
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>

                <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-lg">ID #{reservation.id}</Badge>
                    {getStatusBadge(reservation.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                
                <div className="space-y-6 xl:col-span-8">
                    
                    {/* Price History Summary */}
                    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                        <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <History size={18} /> Ringkasan Biaya & Negosiasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">{t("harga_awal_sistem")}</p>
                                        <p className="text-xl font-bold text-muted-foreground mt-1">{formatRp(initialPrice)}</p>
                                        <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                                            <AlertCircle size={10} /> Berdasarkan tarif {formatRp(reservation.machine?.hourly_rate)}/jam
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                        <p className="text-[10px] font-bold text-primary tracking-wider">{t("harga_akhir_disepakati")}</p>
                                        <p className="text-2xl font-black text-primary mt-1">{formatRp(finalPrice)}</p>
                                        {finalPrice !== initialPrice && (
                                            <p className={`text-xs font-semibold mt-2 ${finalPrice < initialPrice ? 'text-success' : 'text-destructive'}`}>
                                                {finalPrice < initialPrice ? "Hemat" : "Selisih"} {formatRp(Math.abs(finalPrice - initialPrice))} ({Math.abs(((finalPrice - initialPrice) / initialPrice) * 100).toFixed(1)}%)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-muted-foreground tracking-wider">{t("riwayat_tawar_menawar")}</p>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                                        {reservation.negotiations?.length > 0 ? (
                                            reservation.negotiations.map((neg: any, idx: number) => (
                                                <div key={neg.id} className="p-3 rounded-xl bg-muted/20 border border-border/50 relative overflow-hidden">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${neg.status === 'accepted' ? 'bg-success' : neg.status === 'rejected' ? 'bg-destructive' : 'bg-primary'}`} />
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold tracking-tight text-muted-foreground">Penawaran #{idx + 1}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${neg.status === 'accepted' ? 'bg-success/10 text-success' : neg.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                                            {neg.status === 'accepted' ? 'DISETUJUI' : neg.status === 'rejected' ? 'DITOLAK' : 'PENGAJUAN'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-black">{formatRp(neg.offered_price)}</p>
                                                        <p className="text-[10px] text-muted-foreground">{formatDT(neg.created_at)}</p>
                                                    </div>
                                                    {neg.notes && <p className="text-[11px] text-muted-foreground mt-2 italic border-l-2 border-border/50 pl-2">"{neg.notes}"</p>}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/50">
                                                <p className="text-xs text-muted-foreground italic">{t("tidak_ada_riwayat_tawar_menawar")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                        
                        <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
                            
                            <CardTitle className="text-xl font-bold">
                                Timeline Reservasi
                            </CardTitle>

                            <CardDescription>
                                Jejak aktivitas reservasi dari awal hingga selesai.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6">
                            
                            <div className="relative">
                                
                                <div className="absolute bottom-0 left-6 top-0 w-px bg-border/50" />

                                <div className="space-y-8">
                                    
                                    {steps.map((step, idx) => {
                                        const stepNumber = idx + 1;
                                        const isCompleted = currentStep > stepNumber;
                                        const isCurrent  = currentStep === stepNumber;
                                        const isSkipped  = step.key === "negotiating" && !hasNegotiation && currentStep > 2;

                                        return (
                                            <div key={step.key} className="relative flex gap-4">
                                                <div
                                                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                                                        isSkipped
                                                            ? "border-border/30 bg-muted/30 text-muted-foreground/40"
                                                            : isCompleted
                                                            ? "border-primary/20 bg-primary/10 text-primary ring-2 ring-primary/10"
                                                            : isCurrent
                                                            ? "border-primary/40 bg-primary/5 text-primary"
                                                            : "border-border/50 bg-background text-muted-foreground"
                                                    }`}
                                                >
                                                    <step.icon className="h-5 w-5" />
                                                </div>

                                                <div className="pt-1">
                                                    <h3 className={`text-sm font-semibold ${
                                                        isSkipped ? "text-muted-foreground/40 line-through" :
                                                        isCompleted ? "text-foreground" :
                                                        isCurrent  ? "text-primary" : "text-muted-foreground"
                                                    }`}>{step.label}</h3>

                                                    {/* Pengajuan */}
                                                    {step.key === "submitted" && (
                                                        <p className="mt-1 text-xs text-muted-foreground">Diajukan {formatDT(reservation.created_at)}</p>
                                                    )}

                                                    {/* Negosiasi */}
                                                    {step.key === "negotiating" && isSkipped && (
                                                        <p className="mt-1 text-xs text-muted-foreground/40 italic">{t("tidak_ada_negosiasi")}</p>
                                                    )}
                                                    {step.key === "negotiating" && !isSkipped && hasNegotiation && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {reservation.negotiations.length} putaran penawaran
                                                        </p>
                                                    )}
                                                    {step.key === "negotiating" && !isSkipped && !hasNegotiation && isCurrent && (
                                                        <p className="mt-1 text-xs text-muted-foreground italic">{t("menunggu_negosiasi")}</p>
                                                    )}

                                                    {step.key === "approved" && isCompleted && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {approvedAt ? `Disetujui pada ${formatDT(approvedAt)}` : "Telah disetujui"}
                                                        </p>
                                                    )}
                                                    {step.key === "approved" && !isCompleted && (
                                                        <p className="mt-1 text-xs text-muted-foreground italic">{t("menunggu_persetujuan_penyedia")}</p>
                                                    )}

                                                    {/* Pembayaran */}
                                                    {step.key === "payment" && isCompleted && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {paidAt ? `Pembayaran diterima pada ${formatDT(paidAt)}` : "Pembayaran telah diterima"}
                                                        </p>
                                                    )}
                                                    {step.key === "payment" && isCurrent && reservation.payment_status === "awaiting_confirmation" && (
                                                        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 italic">{t("menunggu_konfirmasi_penyedia")}</p>
                                                    )}
                                                    {step.key === "payment" && !isCompleted && !isCurrent && (
                                                        <p className="mt-1 text-xs text-muted-foreground italic">{t("menunggu_pembayaran_penyewa")}</p>
                                                    )}

                                                    {/* Selesai */}
                                                    {step.key === "completed" && isCompleted && (
                                                        <p className="mt-1 text-xs text-success font-semibold">
                                                            {paidAt ? `Reservasi selesai pada ${formatDT(paidAt)}` : "Reservasi telah selesai"}
                                                        </p>
                                                    )}
                                                    {step.key === "completed" && !isCompleted && (
                                                        <p className="mt-1 text-xs text-muted-foreground italic">{t("menunggu_penyelesaian")}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/50 bg-card">
                        
                        <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
                            
                            <CardTitle className="text-lg font-bold">
                                Detail Pelaksanaan
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6 p-6">
                            
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                
                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                    
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Waktu Mulai
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {formatDT(
                                            reservation.start_time
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                    
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Waktu Selesai
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                                        <Clock className="h-4 w-4 text-primary" />
                                        {formatDT(
                                            reservation.end_time
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                
                                <p className="text-xs font-medium text-muted-foreground">
                                    Keperluan Produksi
                                </p>

                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm italic leading-relaxed text-muted-foreground">
                                    "{reservation.purpose ||
                                        "Tidak Ada Deskripsi"}"
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

<div className="space-y-6 xl:col-span-4">
    
   <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        
        <div className="relative h-48 overflow-hidden bg-muted/20">
            
            {getMachineImage(
                reservation.machine
            ) ? (
                <img
                    src={getMachineImage(
                        reservation.machine
                    )}
                    alt={
                        reservation
                            .machine
                            ?.name
                    }
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                    
                    <span className="text-sm font-medium text-muted-foreground">
                        Tidak Ada Gambar
                    </span>
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h2 className="line-clamp-2 text-base font-bold text-white">
                    {reservation.machine?.name}
                </h2>
                {reservation.machine?.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/80">
                        <MapPin size={12} />
                        {reservation.machine.location}
                    </p>
                )}
            </div>
        </div>

        <CardContent className="space-y-6 p-6">
            
            <div className="grid grid-cols-2 gap-4">
                
                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
                        Tarif / Jam
                    </p>

                    <h3 className="mt-1 text-sm font-bold">
                        {formatRp(
                            reservation
                                .machine
                                ?.hourly_rate ||
                                0
                        )}
                    </h3>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    
                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
                        Durasi
                    </p>

                    <h3 className="mt-1 text-sm font-bold">
                        {durationHours.toFixed(
                            1
                        )}{" "}
                        Jam
                    </h3>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg border border-border/50 overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {(() => {
                            const m = reservation.machine;
                            const logo = m?.owner?.logo_url || m?.owner?.photo || m?.owner_logo_url;
                            const name = m?.owner?.name || m?.owner?.business_name || "W";
                            return logo ? (
                                <img src={logo} alt={name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xs font-black">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            );
                        })()}
                    </div>
                    <div>
                        {(() => {
                            const m = reservation.machine;
                            const isUmkmOwner = user?.umkm?.id === m?.owner_id && m?.owner_type?.includes('Umkm');
                            const isInstOwner = (user?.institutions ?? []).some((i: any) => i.id === m?.owner_id) && m?.owner_type?.includes('Institution');
                            const isOrgOwner  = (user?.organizations ?? []).some((o: any) => o.id === m?.owner_id) && m?.owner_type?.includes('Organization');
                            const isMine = isUmkmOwner || isInstOwner || isOrgOwner;
                            return (
                                <>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
                                        {isMine ? "Kepemilikan" : "Penyedia Mesin"}
                                    </p>
                                    <p className="text-sm font-bold">
                                        {isMine ? "Mesin Ini Milik Anda" : (m?.owner?.name || "Workshop")}
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">{t("status_bayar")}</span>
                        {getPaymentBadge(reservation.payment_status)}
                    </div>
                </div>
            </div>

            {(reservation.status === "approved" || reservation.status === "completed") && (
                <Button
                    className="h-11 w-full rounded-xl font-bold shadow-lg shadow-primary/20"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                >
                    {downloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    {downloadingPdf ? "Mengunduh..." : "Unduh Invoice"}
                </Button>
            )}

            {/* Pay button for approved + unpaid */}
            {reservation.status === "approved" &&
                reservation.payment_status !== "paid" &&
                reservation.payment_status !== "awaiting_confirmation" && (
                <div className="flex flex-col gap-2 mt-2">
                    {reservation.xendit_invoice_url ? (
                        <Button
                            className="h-11 w-full rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            onClick={() => window.open(reservation.xendit_invoice_url, "_blank")}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Lanjutkan Pembayaran Online
                        </Button>
                    ) : (
                        <Button
                            className="h-11 w-full rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            onClick={handleXenditPayment}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                            Bayar Online (Otomatis Verifikasi)
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="h-11 w-full rounded-xl font-bold text-success border-success/30 hover:bg-success/5"
                        onClick={() => setPaymentDialogOpen(true)}
                        disabled={submitting}
                    >
                        Bayar Manual (Transfer Bank / Cash)
                    </Button>
                </div>
            )}

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-muted/10 border-b border-border/50">
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard size={18} className="text-primary" />
                            Konfirmasi Pembayaran
                        </DialogTitle>
                        <DialogDescription>
                            Upload bukti transfer untuk reservasi mesin <strong>{reservation.machine?.name}</strong>.
                            Total: <strong>{formatRp(finalPrice)}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPayment}>
                        <div className="p-6 space-y-5">
                            {payStatus && (
                                <div className={`p-3 rounded-xl text-sm font-medium ${payStatus.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                    {payStatus.message}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Metode Pembayaran</Label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm(f => ({ ...f, payment_method: e.target.value }))}
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
                                    <div onClick={() => paymentFileRef.current?.click()} className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-4">
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
                                    className="rounded-xl h-11"
                                    placeholder="Nomor rekening, waktu transfer, dll."
                                    value={paymentForm.payment_notes}
                                    onChange={(e) => setPaymentForm(f => ({ ...f, payment_notes: e.target.value }))}
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl font-semibold mt-4">
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                {paymentForm.payment_method === "xendit" ? "Bayar via Xendit" : "Kirim Pembayaran"}
                            </Button>
                        </div>
                        <DialogFooter className="p-6 bg-muted/5 border-t border-border/50">
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setPaymentDialogOpen(false)}>Batal</Button>
                            <Button type="submit" className="rounded-xl font-bold gap-2 bg-success hover:bg-success/90" disabled={submitting}>
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                                Kirim Bukti Bayar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Button
                variant="outline"
                className="h-11 w-full rounded-xl border-border/50 font-semibold"
                onClick={() =>
                    router.push(
                        `/workspace/reservations/${reservation.machine?.id}`
                    )
                }
            >
                Lihat Detail Mesin
            </Button>
        </CardContent>
    </Card>
</div>
            </div>
        </div>
    );
}
