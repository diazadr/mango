"use client";

import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    use,
} from "react";

import api from "@/src/lib/http/axios";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { useRouter } from "@/src/i18n/navigation";

import {
    Loader2,
    Calendar,
    Clock,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    MessageCircle,
    CircleDollarSign,
    History,
    Building2,
    User,
    Send,
    AlertCircle,
    Check,
    CreditCard,
    FileText,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { useTranslations } from "next-intl";
import { setBreadcrumbLabel } from "@/src/components/layouts/dashboard/navbar/NavBreadcrumbs";

function formatDT(s: string) {
    if (!s) return "-";
    const d = new Date(s);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
        " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatRp(n: number) {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function calcDurationHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
    return Math.max(0, diff);
}

const getMachineImage = (machine: any) => {
    if (!machine) return null;
    const candidates = [machine.image_url, machine.image, machine.thumbnail];
    const image = candidates.find(item => item && typeof item === "string");
    if (!image) return null;
    if (image.startsWith("http")) return image;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "");
    return `${baseUrl}${image}`;
};

const getOwnerLogo = (machine: any) => {
    if (!machine) return null;
    return machine.owner_logo || machine.owner_logo_url || machine.owner?.logo_url || null;
};

export function ReservationApprovalDetailView({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("ReservationApprovalDetailView");
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'destructive', message: string } | null>(null);

    const [negDialogOpen, setNegDialogOpen] = useState(false);
    const [negForm, setNegForm] = useState({ price: "", display: "", notes: "" });
    const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/v1/machines/reservations/${id}`);
            setReservation(res.data.data);
        } catch (err) {
            console.error(err);
            router.push("/workspace/reservations/approvals");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (reservation?.machine?.name && id) {
            setBreadcrumbLabel(String(id), reservation.machine.name);
        }
    }, [reservation, id]);

    const isOwner = useMemo(() => {
        if (!reservation || !user) return false;
        const m = reservation.machine;
        const isSuperAdmin = user.roles?.includes('super_admin');
        const isAdmin = user.roles?.includes('admin');
        const isUmkmOwner = user.umkm?.id === m?.owner_id && m?.owner_type?.includes('Umkm');
        const userInstIds = user.institutions?.map((i: any) => i.id) || [];
        const isInstOwner = userInstIds.includes(m?.owner_id) && m?.owner_type?.includes('Institution');
        const userOrgIds = user.organizations?.map((o: any) => o.id) || [];
        const isOrgOwner = userOrgIds.includes(m?.owner_id) && m?.owner_type?.includes('Organization');
        return isSuperAdmin || isAdmin || isUmkmOwner || isInstOwner || isOrgOwner;
    }, [reservation, user]);

    const handleAction = async (action: 'approve' | 'reject') => {
        setSubmitting(true);
        try {
            await api.post(`/v1/machines/reservations/${id}/approve`, { action });
            setStatus({ type: 'success', message: `Reservasi berhasil di${action === 'approve' ? 'setujui' : 'tolak'}.` });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'destructive', message: err.response?.data?.message || "Gagal memproses." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRespondNeg = async (negId: number, action: 'accept' | 'reject') => {
        setSubmitting(true);
        try {
            await api.post(`/v1/machines/reservations/${id}/negotiate/${negId}/respond`, { action });
            setStatus({ type: 'success', message: `Negosiasi di${action === 'accept' ? 'terima' : 'tolak'}.` });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'destructive', message: err.response?.data?.message || "Gagal merespons." });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePropose = async () => {
        setSubmitting(true);
        try {
            await api.post(`/v1/machines/reservations/${id}/negotiate`, {
                proposed_price: negForm.price,
                notes: negForm.notes
            });
            setStatus({ type: 'success', message: t("msg_penawaran_harga_berhasil_dikirim") });
            setNegDialogOpen(false);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'destructive', message: err.response?.data?.message || "Gagal mengirim." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        setSubmitting(true);
        try {
            await api.post(`/v1/machines/reservations/${id}/confirm-payment`);
            setStatus({ type: 'success', message: t("msg_pembayaran_berhasil_dikonfirmasi") });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'destructive', message: err.response?.data?.message || "Gagal konfirmasi." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-[70vh] flex-col items-center justify-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm font-medium text-muted-foreground">{t("memuat_transaksi")}</p></div>;
    if (!reservation) return null;

    const duration = calcDurationHours(reservation.start_time, reservation.end_time);
    const initialPrice = duration * (reservation.machine?.hourly_rate || 0);
    const currentPrice = reservation.quoted_price || initialPrice;
    const pendingNeg = reservation.negotiations?.find((n: any) => n.status === 'pending');
    const isMyProposal = pendingNeg && pendingNeg.user_id === user?.id;

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2" onClick={() => router.back()}><ArrowLeft size={16} /> {t("kembali")}</Button>
                <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-lg">ID #{reservation.id}</Badge>
                    {isOwner ? <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">{t("penyedia")}</Badge> : <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">{t("penyewa")}</Badge>}
                </div>
            </div>

            {status && (
                <Alert variant={status.type} className="rounded-xl">
                    <AlertDescription className="flex items-center justify-between">
                        <span>{status.message}</span>
                        <XCircle className="h-4 w-4 cursor-pointer" onClick={() => setStatus(null)} />
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-8">
                    {/* Interaction Card */}
                    <Card className="rounded-2xl border-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/50">
                            <CardTitle>{t("negosiasi_persetujuan")}</CardTitle>
                            <CardDescription>{t("komunikasi_harga_antara_penyewa_dan_peny")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Negotiation History */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                                    <History size={14} /> Riwayat Penawaran
                                </p>
                                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                                    {/* Initial Price Item */}
                                    <div className="relative pl-10">
                                        <div className="absolute left-2 top-1 h-4 w-4 rounded-full bg-muted border-2 border-background ring-2 ring-muted/20" />
                                        <div className="flex justify-between items-start bg-muted/20 p-3 rounded-xl border border-border/30">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground tracking-tight">{t("harga_awal_sistem")}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{formatDT(reservation.created_at)}</p>
                                                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                                    <AlertCircle size={10} /> Harga standar berdasarkan tarif per jam
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-muted-foreground">{formatRp(initialPrice)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {reservation.negotiations?.map((neg: any) => (
                                        <div key={neg.id} className="relative pl-10">
                                            <div className={`absolute left-2 top-1 h-4 w-4 rounded-full border-2 border-background ring-2 ${neg.status === 'accepted' ? 'bg-success ring-success/20' : neg.status === 'rejected' ? 'bg-destructive ring-destructive/20' : 'bg-primary ring-primary/20'}`} />
                                            <div className={`flex justify-between items-start p-3 rounded-xl border ${neg.status === 'accepted' ? 'bg-success/5 border-success/20' : neg.status === 'rejected' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20 shadow-sm'}`}>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={`text-xs font-bold tracking-tight ${neg.status === 'accepted' ? 'text-success' : neg.status === 'rejected' ? 'text-destructive' : 'text-primary'}`}>
                                                            Penawaran {neg.user?.id === user?.id ? "Anda" : "Pihak Lawan"}
                                                        </p>
                                                        {neg.status === 'accepted' && <Badge className="bg-success text-[10px] h-4 px-1 rounded hover:bg-success">{t("disepakati")}</Badge>}
                                                        {neg.status === 'rejected' && <Badge className="bg-destructive text-[10px] h-4 px-1 rounded hover:bg-destructive">{t("ditolak")}</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{formatDT(neg.created_at)}</p>
                                                    {neg.notes && (
                                                        <div className="mt-2 relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                                                            <p className="pl-3 text-xs italic text-muted-foreground">"{neg.notes}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-base font-black ${neg.status === 'accepted' ? 'text-success' : neg.status === 'rejected' ? 'text-destructive' : 'text-primary'}`}>
                                                        {formatRp(neg.offered_price)}
                                                    </p>
                                                    {neg.offered_price !== initialPrice && (
                                                        <p className={`text-[10px] font-medium ${neg.offered_price < initialPrice ? 'text-success' : 'text-destructive'}`}>
                                                            {neg.offered_price < initialPrice ? "↓" : "↑"} {Math.abs(((neg.offered_price - initialPrice) / initialPrice) * 100).toFixed(1)}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {reservation.status === 'approved' && (
                                        <div className="relative pl-10 pt-2">
                                            <div className="absolute left-2.5 top-0 bottom-0 w-3 bg-success/10 rounded-full -z-10" />
                                            <div className="bg-success text-white p-4 rounded-2xl shadow-lg shadow-success/20 flex items-center gap-4">
                                                <div className="bg-white/20 p-2 rounded-full">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black tracking-widest">{t("titik_kesepakatan")}</p>
                                                    <p className="text-xs opacity-90 font-medium">{t("harga_akhir_telah_disetujui_oleh_kedua_b")}</p>
                                                    <p className="text-lg font-black mt-1">{formatRp(currentPrice)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Actions Area */}
                            <div className="bg-muted/10 rounded-2xl p-6 border border-border/50">
                                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">{t("harga_aktif_saat_ini")}</p>
                                        <h2 className="text-3xl font-black text-primary">{formatRp(currentPrice)}</h2>
                                        {reservation.quoted_price && initialPrice !== reservation.quoted_price && (
                                            <p className="text-xs text-muted-foreground">
                                                {reservation.quoted_price > initialPrice ? "Meningkat" : "Hemat"} {formatRp(Math.abs(reservation.quoted_price - initialPrice))} dari harga awal.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 w-full md:w-64">
                                        {(() => {
                                            if (pendingNeg) {
                                                if (isMyProposal) {
                                                    return <Alert className="bg-primary/5 border-primary/20"><AlertDescription className="text-xs text-primary font-medium">{t("menunggu_respon_dari_pihak_lawan_atas_pe")}</AlertDescription></Alert>;
                                                }
                                                return (
                                                    <div className="space-y-2">
                                                        <Button className="w-full bg-success hover:bg-success/90 rounded-xl" onClick={() => handleRespondNeg(pendingNeg.id, 'accept')} disabled={submitting}><Check size={16} className="mr-2" /> {t("terima_harga")}</Button>
                                                        <Button variant="outline" className="w-full text-destructive border-destructive/20 rounded-xl" onClick={() => handleRespondNeg(pendingNeg.id, 'reject')} disabled={submitting}><XCircle size={16} className="mr-2" /> {t("tolak")}</Button>
                                                        <Button variant="ghost" className="w-full text-primary rounded-xl" onClick={() => {
                                                            setNegForm({ price: String(pendingNeg.offered_price), display: Number(pendingNeg.offered_price).toLocaleString('id-ID'), notes: "" });
                                                            setNegDialogOpen(true);
                                                        }} disabled={submitting}>{t("balas_penawaran")}</Button>
                                                    </div>
                                                );
                                            }

                                            if (reservation.status === 'pending' || reservation.status === 'negotiating') {
                                                return (
                                                    <div className="space-y-2">
                                                        {isOwner && <Button className="w-full rounded-xl" onClick={() => handleAction('approve')} disabled={submitting}><CheckCircle2 size={16} className="mr-2" /> {t("setujui_reservasi")}</Button>}
                                                        <Button variant="outline" className="w-full rounded-xl" onClick={() => {
                                                            setNegForm({ price: String(currentPrice), display: Number(currentPrice).toLocaleString('id-ID'), notes: "" });
                                                            setNegDialogOpen(true);
                                                        }} disabled={submitting}><MessageCircle size={16} className="mr-2" /> {t("ajukan_negosiasi")}</Button>
                                                        {isOwner && <Button variant="ghost" className="w-full text-destructive" onClick={() => handleAction('reject')} disabled={submitting}>{t("tolak_reservasi")}</Button>}
                                                    </div>
                                                );
                                            }

                                            return <div className="text-center py-2"><Badge variant="outline" className="capitalize">{reservation.status}</Badge></div>;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reservation Details */}
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="text-lg">{t("detail_pelaksanaan")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit"><Calendar size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground">{t("waktu_mulai")}</p>
                                        <p className="text-sm font-semibold">{formatDT(reservation.start_time)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit"><Clock size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground">{t("waktu_selesai")}</p>
                                        <p className="text-sm font-semibold">{formatDT(reservation.end_time)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-muted/20 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><FileText size={12} /> {t("keperluan_produksi")}</p>
                                <p className="text-sm italic text-muted-foreground">"{reservation.purpose || "Tidak ada deskripsi."}"</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 xl:col-span-4">
                    {/* Machine & Party Info */}
                    <Card className="rounded-2xl border-border/50 overflow-hidden">
                        <div className="h-48 bg-muted relative">
                            {getMachineImage(reservation.machine) ? (
                                <img src={getMachineImage(reservation.machine)} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><CircleDollarSign size={40} opacity={0.1} /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{reservation.machine?.name}</h3>
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-6">
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 bg-muted/30 rounded-xl">
                                    <p className="text-[10px] font-bold text-muted-foreground">{t("tarifjam")}</p>
                                    <p className="text-sm font-bold">{formatRp(reservation.machine?.hourly_rate)}</p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-xl">
                                    <p className="text-[10px] font-bold text-muted-foreground">{t("durasi")}</p>
                                    <p className="text-sm font-bold">{duration.toFixed(1)} Jam</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Provider Info */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                    <Building2 size={12} /> {isOwner ? "KEPEMILIKAN" : "PENYEDIA MESIN"}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg border border-border/50 overflow-hidden bg-background flex items-center justify-center">
                                        {getOwnerLogo(reservation.machine) ? <img src={getOwnerLogo(reservation.machine)} className="w-full h-full object-cover" /> : <Building2 size={16} className="text-muted-foreground" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold line-clamp-1">
                                            {isOwner ? "Mesin Ini Milik Anda" : (reservation.machine?.owner?.name || "Workshop")}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {isOwner ? "Aset Pribadi" : "Pihak Penyedia"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Tenant Info */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><User size={12} /> {t("umkm_penyewa")}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg border border-border/50 overflow-hidden bg-background flex items-center justify-center">
                                        {reservation.requester_umkm?.logo_url || reservation.requester_umkm?.photo ? (
                                            <img src={reservation.requester_umkm?.logo_url || reservation.requester_umkm?.photo} className="w-full h-full object-cover" alt="umkm" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xs font-black">
                                                {(reservation.requester_umkm?.name || reservation.requester_umkm?.business_name || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold line-clamp-1">{reservation.requester_umkm?.name || reservation.requester_umkm?.business_name || "—"}</p>
                                        <p className="text-[10px] text-muted-foreground">{reservation.requester_user?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Link */}
                    {(reservation.status === 'approved' || reservation.status === 'completed') && (
                        <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-12" onClick={() => window.open(`/id/invoice/${reservation.id}`, '_blank')}>
                            <FileText size={18} className="mr-2" /> Lihat Invoice / SPK
                        </Button>
                    )}

                    {/* Provider: Confirm payment button */}
                    {isOwner && reservation.payment_status === 'awaiting_confirmation' && (
                        <Button
                            className="w-full rounded-xl h-12 font-bold bg-success hover:bg-success/90 shadow-lg shadow-success/20 gap-2"
                            onClick={() => setConfirmPaymentOpen(true)}
                            disabled={submitting}
                        >
                            <CreditCard size={18} /> Konfirmasi Pembayaran
                        </Button>
                    )}
                </div>
            </div>

            {/* Negotiation Dialog */}
            <Dialog open={negDialogOpen} onOpenChange={setNegDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-muted/10 border-b border-border/50">
                        <DialogTitle>{t("ajukan_penawaran_harga")}</DialogTitle>
                        <DialogDescription>{t("beri_tahu_pihak_lawan_harga_yang_anda_in")}</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label>{t("harga_penawaran_baru")}</Label>
                            <div className="relative">
                                <CircleDollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    className="pl-10 h-11 rounded-xl font-bold" 
                                    placeholder="0" 
                                    value={negForm.display}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, "");
                                        setNegForm(f => ({ ...f, price: digits, display: digits ? Number(digits).toLocaleString('id-ID') : "" }));
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Harga saat ini: {formatRp(currentPrice)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("catatan_tambahan")}</Label>
                            <Textarea 
                                placeholder={t("placeholder_jelaskan_alasan_atau_penawaran_anda")} 
                                className="rounded-xl min-h-[100px]"
                                value={negForm.notes}
                                onChange={(e) => setNegForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-muted/5 border-t border-border/50">
                        <Button variant="outline" className="rounded-xl" onClick={() => setNegDialogOpen(false)}>{t("batal")}</Button>
                        <Button className="rounded-xl gap-2 font-bold" onClick={handlePropose} disabled={submitting || !negForm.price}>
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim Penawaran
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Payment AlertDialog */}
            <AlertDialog open={confirmPaymentOpen} onOpenChange={setConfirmPaymentOpen}>
                <AlertDialogContent className="rounded-2xl border-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black flex items-center gap-2">
                            <CreditCard size={20} className="text-success" />
                            Konfirmasi Pembayaran
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            Apakah Anda yakin ingin mengkonfirmasi penerimaan pembayaran sebesar{" "}
                            <span className="font-black text-foreground">{formatRp(currentPrice)}</span> dari penyewa? <br />
                            Tindakan ini akan menandai reservasi sebagai <span className="font-semibold text-success">Selesai</span> dan tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-xl bg-success hover:bg-success/90 font-bold gap-2"
                            onClick={handleConfirmPayment}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Ya, Konfirmasi Pembayaran
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
