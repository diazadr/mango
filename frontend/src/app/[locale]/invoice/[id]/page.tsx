"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/http/axios";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ─── Design tokens (matching globals.css) ────────────────────────────────────
const C = {
    primary:   "#1e477e",   // mango-blue
    hover:     "#153460",   // mango-hover
    accent:    "#f97316",   // orange
    success:   "#22c55e",
    warning:   "#f59e0b",
    danger:    "#ef4444",
    fg:        "#0f172a",
    muted:     "#64748b",
    border:    "#e2e8f0",
    bg:        "#f8fafc",
    white:     "#ffffff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRp(n: number) { return "Rp " + Math.round(n).toLocaleString("id-ID"); }
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "Menunggu Persetujuan", color: C.warning,  bg: "#fef3c7" },
    approved:  { label: "Disetujui",            color: C.success,  bg: "#dcfce7" },
    rejected:  { label: "Ditolak",              color: C.danger,   bg: "#fee2e2" },
    completed: { label: "Selesai",              color: C.primary,  bg: "#dbeafe" },
    cancelled: { label: "Dibatalkan",           color: C.muted,    bg: "#f1f5f9" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InvoicePage() {
    const params = useParams();
    const id = params?.id as string;

    const [res, setRes]       = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        api.get(`/v1/machines/reservations/${id}`)
            .then(r => setRes(r.data.data))
            .catch(e => setError(e.response?.data?.message || "Gagal memuat data reservasi."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#1e477e]" size={36} />
                <p className="text-sm font-semibold text-slate-500">Memuat bukti reservasi...</p>
            </div>
        </div>
    );

    if (error || !res) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-3">
                <p className="text-red-500 font-bold">{error || "Data tidak ditemukan."}</p>
                <Link href="/id/workspace/reservations" className="text-sm text-blue-600 underline">← Kembali</Link>
            </div>
        </div>
    );

    const invoiceNo  = `RES-${String(res.id).padStart(6, "0")}`;
    const issued     = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const duration   = durHours(res.start_time, res.end_time);
    const hourlyRate = res.machine?.hourly_rate || 0;
    const total      = duration * hourlyRate;
    const sc         = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.pending;

    return (
        <>
            {/* Print-specific styles */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; background: ${C.bg}; margin: 0; }
                @media print {
                    body { background: white; }
                    .no-print { display: none !important; }
                    .invoice-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                }
            `}</style>

            {/* Top bar (screen only) */}
            <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <Link href="/id/workspace/reservations" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Reservasi
                </Link>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.hover})` }}
                >
                    <Printer size={15} /> Cetak / Simpan PDF
                </button>
            </div>

            {/* Invoice wrapper */}
            <div className="py-8 px-4 min-h-screen" style={{ background: C.bg }}>
                <div
                    className="invoice-page mx-auto bg-white rounded-3xl overflow-hidden"
                    style={{
                        maxWidth: "794px",
                        boxShadow: "0 20px 60px rgba(30,71,126,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* ── HEADER BANNER ────────────────────────────────────── */}
                    <div
                        style={{
                            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.hover} 60%, #0f2848 100%)`,
                            padding: "36px 40px 32px",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Decorative circles */}
                        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
                        <div style={{ position:"absolute", bottom:-60, right:80, width:220, height:220, borderRadius:"50%", background:"rgba(249,115,22,0.12)" }} />

                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
                            {/* Brand */}
                            <div>
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                    <div style={{
                                        background:"rgba(255,255,255,0.15)",
                                        borderRadius:12,
                                        width:44, height:44,
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:18, fontWeight:900, color:"white", letterSpacing:-1,
                                    }}>M</div>
                                    <span style={{ fontSize:26, fontWeight:900, color:"white", letterSpacing:-1 }}>MANGO</span>
                                </div>
                                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11, fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase" }}>
                                    Platform IKM Digital · Reservasi Permesinan
                                </p>
                            </div>

                            {/* Invoice meta */}
                            <div style={{ textAlign:"right" }}>
                                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>
                                    Bukti Reservasi
                                </p>
                                <p style={{ color:"white", fontSize:22, fontWeight:900, letterSpacing:-0.5, marginBottom:2 }}>{invoiceNo}</p>
                                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Diterbitkan: {issued}</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div style={{ marginTop:24 }}>
                            <span style={{
                                display:"inline-block",
                                padding:"6px 18px",
                                borderRadius:99,
                                fontSize:11,
                                fontWeight:800,
                                textTransform:"uppercase",
                                letterSpacing:"0.8px",
                                background:"rgba(255,255,255,0.15)",
                                color:"white",
                                border:"1.5px solid rgba(255,255,255,0.25)",
                                backdropFilter:"blur(4px)",
                            }}>
                                {sc.label}
                            </span>
                        </div>
                    </div>

                    {/* ── CONTENT ──────────────────────────────────────────── */}
                    <div style={{ padding:"36px 40px" }}>

                        {/* Section label helper */}
                        {(() => {
                            const SL = ({ children }: { children: React.ReactNode }) => (
                                <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.2px", color:C.muted, marginBottom:12 }}>{children}</p>
                            );
                            const InfoBox = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
                                <div style={{ background:C.bg, borderRadius:14, padding:"14px 18px", border:`1px solid ${C.border}` }}>
                                    <p style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", color:C.muted, marginBottom:4 }}>{label}</p>
                                    <p style={{ fontSize:14, fontWeight:700, color:C.fg, lineHeight:1.3 }}>{value}</p>
                                    {sub && <p style={{ fontSize:11, fontWeight:500, color:C.muted, marginTop:2 }}>{sub}</p>}
                                </div>
                            );

                            return (
                                <>
                                    {/* Machine info */}
                                    <SL>Informasi Mesin</SL>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
                                        <InfoBox label="Nama Mesin" value={res.machine?.name || "-"} sub={[res.machine?.brand, res.machine?.type].filter(Boolean).join(" · ") || undefined} />
                                        <InfoBox label="Lokasi" value={res.machine?.location || "Workshop"} sub={`Kode: ${res.machine?.code || "-"}`} />
                                    </div>

                                    {/* Time */}
                                    <SL>Periode Penggunaan</SL>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
                                        <InfoBox
                                            label="Waktu Mulai"
                                            value={fmtDate(res.start_time, { weekday:"short", day:"2-digit", month:"long", year:"numeric" })}
                                            sub={`Pukul ${fmtTime(res.start_time)} WIB`}
                                        />
                                        <InfoBox
                                            label="Waktu Selesai"
                                            value={fmtDate(res.end_time, { weekday:"short", day:"2-digit", month:"long", year:"numeric" })}
                                            sub={`Pukul ${fmtTime(res.end_time)} WIB`}
                                        />
                                    </div>

                                    {/* Cost table */}
                                    <SL>Rincian Biaya</SL>
                                    <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:24 }}>
                                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                                <tr style={{ background:C.bg }}>
                                                    {["Deskripsi", "Durasi", "Tarif/Jam", "Subtotal"].map(h => (
                                                        <th key={h} style={{ padding:"11px 16px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", color:C.muted, textAlign: h === "Deskripsi" ? "left" : "right", borderBottom:`1px solid ${C.border}` }}>
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding:"13px 16px", fontSize:13, fontWeight:600, color:C.fg }}>
                                                        Sewa {res.machine?.name || "Mesin"}
                                                    </td>
                                                    <td style={{ padding:"13px 16px", fontSize:13, color:C.fg, textAlign:"right" }}>{duration.toFixed(1)} jam</td>
                                                    <td style={{ padding:"13px 16px", fontSize:13, color:C.fg, textAlign:"right" }}>{formatRp(hourlyRate)}</td>
                                                    <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:C.fg, textAlign:"right" }}>{formatRp(total)}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background:`linear-gradient(135deg, ${C.primary}10, ${C.primary}05)`, borderTop:`2px solid ${C.primary}` }}>
                                                    <td colSpan={3} style={{ padding:"14px 16px", fontSize:13, fontWeight:800, color:C.primary, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                                                        Total Estimasi
                                                    </td>
                                                    <td style={{ padding:"14px 16px", fontSize:18, fontWeight:900, color:C.primary, textAlign:"right" }}>
                                                        {formatRp(total)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Purpose */}
                                    {res.purpose && (
                                        <div style={{ background:C.bg, borderRadius:14, padding:"16px 18px", marginBottom:20, border:`1px solid ${C.border}` }}>
                                            <SL>Tujuan Penggunaan</SL>
                                            <p style={{ fontSize:13, color:C.fg, lineHeight:1.7 }}>{res.purpose}</p>
                                        </div>
                                    )}

                                    {/* Rejection reason */}
                                    {res.rejection_reason && (
                                        <div style={{ background:"#fff5f5", borderRadius:14, padding:"16px 18px", marginBottom:20, border:"1px solid #fecaca" }}>
                                            <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.2px", color:C.danger, marginBottom:8 }}>Alasan Penolakan</p>
                                            <p style={{ fontSize:13, color:"#991b1b", lineHeight:1.7 }}>{res.rejection_reason}</p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* ── FOOTER ─────────────────────────────────────── */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:32, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                            <div>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                    <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg, ${C.primary}, ${C.hover})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"white" }}>M</div>
                                    <span style={{ fontWeight:800, fontSize:13, color:C.primary }}>MANGO</span>
                                </div>
                                <p style={{ fontSize:10, color:C.muted, lineHeight:1.6 }}>Dokumen ini diterbitkan secara elektronik.<br />Sah tanpa tanda tangan basah.</p>
                                <p style={{ fontSize:10, color:C.muted, marginTop:4 }}>Dicetak: {new Date().toLocaleString("id-ID")}</p>
                            </div>

                            {/* Signature box */}
                            <div style={{ textAlign:"center" }}>
                                <div style={{
                                    width:140, height:80,
                                    border:`2px dashed ${C.border}`,
                                    borderRadius:12,
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    marginBottom:6,
                                }}>
                                    <p style={{ fontSize:10, color:C.border, fontWeight:600 }}>Tanda Tangan</p>
                                </div>
                                <p style={{ fontSize:9, color:C.muted, fontWeight:600 }}>Pejabat Berwenang</p>
                            </div>
                        </div>

                        {/* Accent bottom strip */}
                        <div style={{ height:4, borderRadius:99, background:`linear-gradient(90deg, ${C.primary}, ${C.accent})`, marginTop:28 }} />
                    </div>
                </div>

                {/* Bottom print hint (screen only) */}
                <div className="no-print" style={{ textAlign:"center", marginTop:24, marginBottom:32 }}>
                    <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
                        Klik <strong>Cetak / Simpan PDF</strong> di atas, lalu pilih <em>"Save as PDF"</em> pada dialog cetak.
                    </p>
                </div>
            </div>
        </>
    );
}
