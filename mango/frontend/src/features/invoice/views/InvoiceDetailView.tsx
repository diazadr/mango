"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/http/axios";
import { Loader2, Printer, ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRp(n: number) {
    return "Rp " + Math.round(n || 0).toLocaleString("id-ID");
}
function durHours(s: string, e: string) {
    if (!s || !e) return 0;
    return Math.max(0, (new Date(e).getTime() - new Date(s).getTime()) / 3_600_000);
}
function fmtDate(dt: string, opts?: Intl.DateTimeFormatOptions) {
    if (!dt) return "-";
    return new Date(dt).toLocaleDateString("id-ID", opts ?? { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function fmtTime(dt: string) {
    if (!dt) return "-";
    return new Date(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
    pending:    { label: "Menunggu Persetujuan", icon: Clock,        bg: "#fef9ec", text: "#b45309", border: "#fde68a" },
    negotiating:{ label: "Proses Negosiasi",    icon: AlertCircle,  bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    approved:   { label: "Disetujui",            icon: CheckCircle2, bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    rejected:   { label: "Ditolak",              icon: XCircle,      bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
    completed:  { label: "Selesai & Lunas",      icon: CheckCircle2, bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    cancelled:  { label: "Dibatalkan",           icon: XCircle,      bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
};

const PAY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    unpaid:                { label: "Belum Bayar",          bg: "#fff7ed", text: "#c2410c" },
    awaiting_confirmation: { label: "Menunggu Konfirmasi",  bg: "#eff6ff", text: "#1d4ed8" },
    paid:                  { label: "Lunas",                bg: "#f0fdf4", text: "#15803d" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export function InvoiceDetailView() {
    const params = useParams();
    const id = params?.id as string;

    const [res, setRes]         = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        api.get(`/v1/machines/reservations/${id}`)
            .then(r => setRes(r.data.data))
            .catch(e => setError(e.response?.data?.message || "Gagal memuat data reservasi."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Loader2 className="animate-spin" size={36} style={{ color: "#1e477e" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Memuat dokumen reservasi…</p>
            </div>
        </div>
    );

    if (error || !res) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
            <div style={{ textAlign: "center" }}>
                <p style={{ color: "#ef4444", fontWeight: 700, marginBottom: 12 }}>{error || "Data tidak ditemukan."}</p>
                <Link href="/id/workspace/reservations" style={{ fontSize: 13, color: "#1e477e", textDecoration: "underline" }}>← Kembali</Link>
            </div>
        </div>
    );

    const invoiceNo  = `INV/${new Date().getFullYear()}/${String(res.id).padStart(6, "0")}`;
    const issued     = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const duration   = durHours(res.start_time, res.end_time);
    const hourlyRate = res.machine?.hourly_rate || 0;
    const estimasi   = duration * hourlyRate;
    const finalTotal = res.quoted_price ?? estimasi;
    const sc         = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.pending;
    const pc         = PAY_CONFIG[res.payment_status ?? "unpaid"] ?? PAY_CONFIG.unpaid;
    const StatusIcon = sc.icon;
    const qrValue    = typeof window !== "undefined"
        ? `${window.location.origin}/id/invoice/${res.id}`
        : `https://mango-polman.vercel.app/id/invoice/${res.id}`;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif !important; margin: 0; background: #f8fafc; }

                @media print {
                    html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print  { display: none !important; }
                    .invoice-wrap { padding: 0 !important; background: white !important; }
                    .invoice-card {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        border: none !important;
                    }
                    @page { size: A4 portrait; margin: 12mm 12mm 12mm 12mm; }
                }
            `}</style>

            {/* ── TOP BAR (screen only) ─────────────────────────────────────── */}
            <div className="no-print" style={{
                position: "sticky", top: 0, zIndex: 50,
                background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid #e2e8f0",
                padding: "12px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <Link href="/id/workspace/reservations" style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 600, color: "#475569", textDecoration: "none",
                }}>
                    <ArrowLeft size={15} /> Kembali ke Reservasi
                </Link>
                <button
                    onClick={() => window.print()}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #1e477e, #153460)",
                        color: "white", fontSize: 13, fontWeight: 700,
                        boxShadow: "0 4px 14px rgba(30,71,126,0.3)",
                    }}
                >
                    <Printer size={15} /> Cetak / Simpan PDF
                </button>
            </div>

            {/* ── INVOICE WRAPPER ───────────────────────────────────────────── */}
            <div className="invoice-wrap" style={{ background: "#f1f5f9", padding: "32px 16px", minHeight: "100vh" }}>
                <div className="invoice-card" style={{
                    maxWidth: 800, margin: "0 auto",
                    background: "white",
                    borderRadius: 20,
                    boxShadow: "0 8px 40px rgba(30,71,126,0.10), 0 2px 8px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                }}>

                    {/* ── HEADER ─────────────────────────────────────────────── */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e477e 0%, #153460 70%, #0d2240 100%)",
                        padding: "32px 40px",
                        position: "relative", overflow: "hidden",
                    }}>
                        {/* Decorative bubbles */}
                        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
                        <div style={{ position:"absolute", bottom:-70, right:60, width:250, height:250, borderRadius:"50%", background:"rgba(249,115,22,0.10)" }} />
                        <div style={{ position:"absolute", top:20, left:"40%", width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }} />

                        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            {/* Brand */}
                            <div>
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                    <div style={{
                                        width:44, height:44, borderRadius:12,
                                        background:"rgba(255,255,255,0.15)",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:20, fontWeight:900, color:"white", letterSpacing:-1,
                                        border:"1.5px solid rgba(255,255,255,0.2)",
                                    }}>M</div>
                                    <div>
                                        <p style={{ color:"white", fontSize:24, fontWeight:900, letterSpacing:-0.5, margin:0, lineHeight:1 }}>MANGO</p>
                                        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, fontWeight:600, margin:0, marginTop:2 }}>Platform IKM Digital</p>
                                    </div>
                                </div>
                                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:10, fontWeight:500, margin:"8px 0 0" }}>
                                    Dokumen Resmi Reservasi Mesin
                                </p>
                            </div>

                            {/* Invoice number */}
                            <div style={{ textAlign:"right" }}>
                                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:9, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", margin:"0 0 4px" }}>
                                    No. Dokumen
                                </p>
                                <p style={{ color:"white", fontSize:18, fontWeight:900, letterSpacing:0.5, margin:"0 0 4px", fontFamily:"monospace" }}>
                                    {invoiceNo}
                                </p>
                                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, margin:0 }}>
                                    Diterbitkan: {issued}
                                </p>
                            </div>
                        </div>

                        {/* Status badges */}
                        <div style={{ marginTop:20, display:"flex", gap:8, flexWrap:"wrap", position:"relative" }}>
                            <span style={{
                                display:"inline-flex", alignItems:"center", gap:5,
                                padding:"5px 14px", borderRadius:99,
                                fontSize:11, fontWeight:700,
                                background:"rgba(255,255,255,0.12)",
                                color:"white",
                                border:"1px solid rgba(255,255,255,0.2)",
                            }}>
                                <StatusIcon size={11} /> {sc.label}
                            </span>
                            <span style={{
                                display:"inline-flex", alignItems:"center", gap:5,
                                padding:"5px 14px", borderRadius:99,
                                fontSize:11, fontWeight:700,
                                background: res.payment_status === "paid" ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.10)",
                                color:"white",
                                border:"1px solid rgba(255,255,255,0.2)",
                            }}>
                                {pc.label}
                            </span>
                        </div>
                    </div>

                    {/* ── BODY ───────────────────────────────────────────────── */}
                    <div style={{ padding:"32px 40px" }}>

                        {/* Section title helper */}
                        {(() => {
                            const Sec = ({ children }: { children: React.ReactNode }) => (
                                <p style={{
                                    fontSize:9, fontWeight:800, letterSpacing:"1.5px",
                                    textTransform:"uppercase", color:"#94a3b8",
                                    margin:"0 0 10px", paddingBottom:6,
                                    borderBottom:"1px solid #f1f5f9",
                                }}>{children}</p>
                            );

                            const Box = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
                                <div style={{
                                    background:"#f8fafc", borderRadius:12, padding:"12px 16px",
                                    border:"1px solid #e2e8f0",
                                }}>
                                    <p style={{ fontSize:9, fontWeight:700, letterSpacing:"0.5px", color:"#94a3b8", margin:"0 0 4px" }}>{label}</p>
                                    <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, lineHeight:1.4, fontFamily: mono ? "monospace" : undefined }}>{value}</p>
                                </div>
                            );

                            return (
                                <>
                                    {/* ── Pihak Terkait ───────────────────── */}
                                    <Sec>Pihak Terkait</Sec>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
                                        <Box label="PENYEWA (UMKM)"
                                            value={res.requester_umkm?.name || res.user?.name || "—"} />
                                        <Box label="PENYEDIA MESIN"
                                            value={res.machine?.owner?.name || "Workshop"} />
                                    </div>

                                    {/* ── Informasi Mesin ─────────────────── */}
                                    <Sec>Informasi Mesin</Sec>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
                                        <Box label="NAMA MESIN" value={res.machine?.name || "—"} />
                                        <Box label="LOKASI" value={res.machine?.location || "Workshop"} />
                                        {res.machine?.brand && <Box label="MEREK / TIPE" value={[res.machine.brand, res.machine.type].filter(Boolean).join(" · ")} />}
                                        {res.machine?.code && <Box label="KODE MESIN" value={res.machine.code} mono />}
                                    </div>

                                    {/* ── Periode Penggunaan ──────────────── */}
                                    <Sec>Periode Penggunaan</Sec>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
                                        <Box label="WAKTU MULAI"
                                            value={`${fmtDate(res.start_time, { day:"2-digit", month:"long", year:"numeric" })} · ${fmtTime(res.start_time)} WIB`} />
                                        <Box label="WAKTU SELESAI"
                                            value={`${fmtDate(res.end_time, { day:"2-digit", month:"long", year:"numeric" })} · ${fmtTime(res.end_time)} WIB`} />
                                    </div>

                                    {/* ── Rincian Biaya ──────────────────── */}
                                    <Sec>Rincian Biaya</Sec>
                                    <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid #e2e8f0", marginBottom:28 }}>
                                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                                <tr style={{ background:"#f8fafc" }}>
                                                    {["Deskripsi", "Rincian", "Subtotal"].map((h, i) => (
                                                        <th key={h} style={{
                                                            padding:"10px 16px",
                                                            fontSize:9, fontWeight:700, letterSpacing:"0.5px",
                                                            color:"#64748b", textAlign: i === 0 ? "left" : "right",
                                                            borderBottom:"1px solid #e2e8f0",
                                                        }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding:"13px 16px", fontSize:13, fontWeight:600, color:"#0f172a" }}>
                                                        Sewa {res.machine?.name || "Mesin"}
                                                    </td>
                                                    <td style={{ padding:"13px 16px", fontSize:12, color:"#475569", textAlign:"right" }}>
                                                        {duration.toFixed(1)} jam × {formatRp(hourlyRate)}
                                                    </td>
                                                    <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:"#0f172a", textAlign:"right" }}>
                                                        {formatRp(estimasi)}
                                                    </td>
                                                </tr>
                                                {finalTotal !== estimasi && (
                                                    <tr style={{ borderTop:"1px dashed #e2e8f0" }}>
                                                        <td colSpan={2} style={{ padding:"12px 16px", fontSize:12, fontWeight:500, color:"#1e477e" }}>
                                                            {finalTotal < estimasi ? "Diskon / Penyesuaian Negosiasi" : "Biaya Tambahan Negosiasi"}
                                                        </td>
                                                        <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color: finalTotal < estimasi ? "#15803d" : "#be123c", textAlign:"right" }}>
                                                            {finalTotal < estimasi ? "-" : "+"}{formatRp(Math.abs(finalTotal - estimasi))}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background:"linear-gradient(135deg, #1e477e08, #1e477e04)", borderTop:"2px solid #1e477e" }}>
                                                    <td colSpan={2} style={{ padding:"14px 16px", fontSize:12, fontWeight:800, color:"#1e477e", letterSpacing:"0.5px" }}>
                                                        TOTAL TAGIHAN
                                                    </td>
                                                    <td style={{ padding:"14px 16px", fontSize:20, fontWeight:900, color:"#1e477e", textAlign:"right" }}>
                                                        {formatRp(finalTotal)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* ── Riwayat Negosiasi ──────────────── */}
                                    {res.negotiations?.length > 0 && (
                                        <>
                                            <Sec>Riwayat Negosiasi Harga</Sec>
                                            <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid #e2e8f0", marginBottom:28 }}>
                                                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                                    <thead>
                                                        <tr style={{ background:"#f8fafc" }}>
                                                            {["Waktu", "Pengaju", "Status", "Harga"].map((h, i) => (
                                                                <th key={h} style={{
                                                                    padding:"10px 16px", fontSize:9, fontWeight:700,
                                                                    letterSpacing:"0.5px", color:"#64748b",
                                                                    textAlign: i < 2 ? "left" : "right",
                                                                    borderBottom:"1px solid #e2e8f0",
                                                                }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {res.negotiations.map((neg: any, idx: number) => (
                                                            <tr key={neg.id} style={{ borderBottom: idx < res.negotiations.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                                                                <td style={{ padding:"11px 16px", fontSize:11, color:"#64748b" }}>
                                                                    {fmtDate(neg.created_at, { day:"2-digit", month:"short", year:"numeric" })} {fmtTime(neg.created_at)}
                                                                </td>
                                                                <td style={{ padding:"11px 16px", fontSize:11, color:"#0f172a", fontWeight:500 }}>
                                                                    {neg.user?.name || "—"}
                                                                </td>
                                                                <td style={{ padding:"11px 16px", textAlign:"right" }}>
                                                                    <span style={{
                                                                        fontSize:9, fontWeight:700, letterSpacing:"0.5px",
                                                                        padding:"3px 8px", borderRadius:99,
                                                                        background: neg.status === "accepted" ? "#f0fdf4" : neg.status === "rejected" ? "#fff1f2" : "#eff6ff",
                                                                        color: neg.status === "accepted" ? "#15803d" : neg.status === "rejected" ? "#be123c" : "#1d4ed8",
                                                                    }}>
                                                                        {neg.status === "accepted" ? "DISETUJUI" : neg.status === "rejected" ? "DITOLAK" : "PENGAJUAN"}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding:"11px 16px", fontSize:12, fontWeight:700, color:"#0f172a", textAlign:"right" }}>
                                                                    {formatRp(neg.offered_price)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}

                                    {/* ── Tujuan & Catatan ───────────────── */}
                                    {(res.purpose || res.quotation_notes) && (
                                        <div style={{ display:"grid", gridTemplateColumns: res.purpose && res.quotation_notes ? "1fr 1fr" : "1fr", gap:12, marginBottom:28 }}>
                                            {res.purpose && (
                                                <div style={{ background:"#f8fafc", borderRadius:12, padding:"14px 16px", border:"1px solid #e2e8f0" }}>
                                                    <p style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:"#94a3b8", textTransform:"uppercase", margin:"0 0 6px" }}>Tujuan Penggunaan</p>
                                                    <p style={{ fontSize:12, color:"#334155", lineHeight:1.6, margin:0 }}>{res.purpose}</p>
                                                </div>
                                            )}
                                            {res.quotation_notes && (
                                                <div style={{ background:"#f0f9ff", borderRadius:12, padding:"14px 16px", border:"1px solid #bae6fd" }}>
                                                    <p style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:"#0369a1", textTransform:"uppercase", margin:"0 0 6px" }}>Catatan Penawaran</p>
                                                    <p style={{ fontSize:12, color:"#075985", lineHeight:1.6, margin:0 }}>{res.quotation_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Alasan Tolak ───────────────────── */}
                                    {res.rejection_reason && (
                                        <div style={{ background:"#fff1f2", borderRadius:12, padding:"14px 16px", border:"1px solid #fecdd3", marginBottom:28 }}>
                                            <p style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:"#be123c", textTransform:"uppercase", margin:"0 0 6px" }}>Alasan Penolakan</p>
                                            <p style={{ fontSize:12, color:"#9f1239", lineHeight:1.6, margin:0 }}>{res.rejection_reason}</p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* ── FOOTER ─────────────────────────────────────────── */}
                        <div style={{
                            display:"flex", justifyContent:"space-between", alignItems:"flex-end",
                            marginTop:28, paddingTop:24, borderTop:"1px solid #e2e8f0",
                            gap:20,
                        }}>
                            {/* Left: Brand + legal */}
                            <div style={{ flex:1 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                                    <div style={{
                                        width:28, height:28, borderRadius:8,
                                        background:"linear-gradient(135deg, #1e477e, #153460)",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:11, fontWeight:900, color:"white",
                                    }}>M</div>
                                    <span style={{ fontWeight:800, fontSize:13, color:"#1e477e" }}>MANGO</span>
                                </div>
                                <p style={{ fontSize:10, color:"#94a3b8", lineHeight:1.7, margin:0 }}>
                                    Dokumen ini diterbitkan secara elektronik oleh Sistem MANGO.<br />
                                    Sah tanpa tanda tangan basah. Verifikasi keaslian melalui QR Code.
                                </p>
                                <p style={{ fontSize:10, color:"#cbd5e1", marginTop:6 }}>
                                    Dicetak: {new Date().toLocaleString("id-ID")}
                                </p>
                            </div>

                            {/* Right: QR Code */}
                            <div style={{ textAlign:"center", flexShrink:0 }}>
                                <div style={{
                                    padding:10, borderRadius:12, border:"1px solid #e2e8f0",
                                    background:"white", display:"inline-block",
                                    boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
                                }}>
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={80}
                                        bgColor="white"
                                        fgColor="#1e477e"
                                        level="M"
                                    />
                                </div>
                                <p style={{ fontSize:9, color:"#94a3b8", margin:"6px 0 0", fontWeight:600, letterSpacing:"0.3px" }}>
                                    Scan untuk verifikasi
                                </p>
                            </div>
                        </div>

                        {/* Accent strip */}
                        <div style={{ height:3, borderRadius:99, background:"linear-gradient(90deg, #1e477e, #f97316)", marginTop:24 }} />
                    </div>
                </div>

                {/* Screen hint */}
                <div className="no-print" style={{ textAlign:"center", marginTop:20, paddingBottom:40 }}>
                    <p style={{ fontSize:12, color:"#94a3b8" }}>
                        Klik <strong style={{ color:"#1e477e" }}>Cetak / Simpan PDF</strong> → pilih <em>"Save as PDF"</em> pada dialog cetak browser.
                    </p>
                </div>
            </div>
        </>
    );
}
