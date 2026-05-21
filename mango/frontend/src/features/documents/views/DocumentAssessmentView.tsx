"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/http/axios";
import { Loader2, Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

// ─── Design tokens ────────────────────────────────────
const C = {
    primary:   "#1e477e",
    hover:     "#153460",
    accent:    "#f97316",
    success:   "#22c55e",
    warning:   "#f59e0b",
    danger:    "#ef4444",
    fg:        "#0f172a",
    muted:     "#64748b",
    border:    "#e2e8f0",
    bg:        "#f8fafc",
    white:     "#ffffff",
};

export function DocumentAssessmentView() {
  const t = useTranslations("DocumentAssessmentView");
    const params = useParams();
    const id = params?.id as string;

    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get(`/v1/assessments/${id}`)
            .then(r => setData(r.data.data))
            .catch(e => setError(e.response?.data?.message || "Gagal memuat data assessment."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('assessment-document');
        if (!element) return;
        
        try {
            setIsDownloading(true);
            const html2pdf = (await import('html2pdf.js')).default;
            const opt: any = {
                margin:       0,
                filename:     `Assessment_${data?.id || 'Document'}.pdf`,
                image:        { type: 'jpeg', quality: 1 },
                pagebreak:    { mode: 'css', before: '.page-break' },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Gagal mengunduh PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#1e477e]" size={36} />
                <p className="text-sm font-semibold text-slate-500">{t("memuat_dokumen")}</p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-3">
                <p className="text-red-500 font-bold">{error || "Data tidak ditemukan."}</p>
                <Link href="/id/workspace/umkm/assessment" className="text-sm text-blue-600 underline">← Kembali</Link>
            </div>
        </div>
    );

    const docNo  = `ASM-${String(data.id).padStart(6, "0")}`;
    const issued = new Date(data.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; background: ${C.bg}; margin: 0; }
                @media print {
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .invoice-page { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; padding: 20mm !important; }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            {/* Top bar (screen only) */}
            <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => window.close()} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Tutup
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.hover})` }}
                >
                    {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                    {isDownloading ? "Memproses PDF..." : "Unduh PDF"}
                </button>
            </div>

            {/* Document wrapper */}
            <div className="py-8 px-4 min-h-screen" style={{ background: C.bg }}>
                <div
                    id="assessment-document"
                    className="invoice-page mx-auto bg-white overflow-hidden"
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
                        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
                        <div style={{ position:"absolute", bottom:-60, right:80, width:220, height:220, borderRadius:"50%", background:"rgba(249,115,22,0.12)" }} />

                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
                            <div>
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                                    <div style={{
                                        background:"white", borderRadius:12, width:44, height:44,
                                        display:"flex", alignItems:"center", justifyContent:"center", padding: 6,
                                    }}>
                                        <img src="/images/logos/logo-mango.png" alt="MANGO Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    </div>
                                    <span style={{ fontSize:26, fontWeight:900, color:"white", letterSpacing:-1 }}>{t("mango")}</span>
                                </div>
                                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11, fontWeight:600, letterSpacing:"0.5px", textTransform:"" }}>
                                    Platform IKM Digital · Self-Assessment
                                </p>
                            </div>
                            <div style={{ textAlign:"right" }}>
                                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:10, fontWeight:700, textTransform:"", letterSpacing:"1px", marginBottom:4 }}>
                                    Hasil Analisis Kematangan
                                </p>
                                <p style={{ color:"white", fontSize:22, fontWeight:900, letterSpacing:-0.5, marginBottom:2 }}>{docNo}</p>
                                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Tanggal: {issued} WIB</p>
                            </div>
                        </div>
                    </div>

                    {/* ── CONTENT ──────────────────────────────────────────── */}
                    <div style={{ padding:"36px 40px" }}>
                        {/* SCORE */}
                        <div style={{ display:"flex", gap:24, marginBottom:32 }}>
                            <div style={{ 
                                background:`linear-gradient(135deg, ${C.primary}, ${C.hover})`, 
                                color:"white", padding:"24px 32px", borderRadius:20, textAlign:"center", minWidth:"200px" 
                            }}>
                                <p style={{ fontSize:10, fontWeight:800, textTransform:"", letterSpacing:"1px", color:"rgba(255,255,255,0.8)", marginBottom:8 }}>{t("total_skor")}</p>
                                <p style={{ fontSize:48, fontWeight:900, lineHeight:1 }}>{data.total_score}</p>
                                <div style={{ height:2, background:"rgba(255,255,255,0.2)", margin:"12px 0" }} />
                                <p style={{ fontSize:16, fontWeight:800 }}>{data.level}</p>
                            </div>
                            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                                <h3 style={{ fontSize:18, fontWeight:800, color:C.fg, marginBottom:8 }}>{t("kesimpulan_assessment")}</h3>
                                <p style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
                                    Berdasarkan hasil analisa mandiri yang telah dilakukan, unit bisnis Anda saat ini berada pada tingkat kematangan <strong>{data.level}</strong>. 
                                    Skor total yang diperoleh adalah <strong>{data.total_score}</strong>. 
                                    Harap perhatikan area dimensi yang memiliki gap untuk diprioritaskan dalam program pendampingan (mentoring) ke depan.
                                </p>
                            </div>
                        </div>

                        {/* CHART DATA TEXT (Since Chart might not print well, we use a clean table) */}
                        <p style={{ fontSize:10, fontWeight:800, textTransform:"", letterSpacing:"1.2px", color:C.muted, marginBottom:12 }}>{t("rincian_dimensi")}</p>
                        <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:32 }}>
                            <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                <thead>
                                    <tr style={{ background:C.bg }}>
                                        <th style={{ padding:"11px 16px", fontSize:10, fontWeight:700, textTransform:"", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.border}` }}>{t("dimensi")}</th>
                                        <th style={{ padding:"11px 16px", fontSize:10, fontWeight:700, textTransform:"", color:C.muted, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>{t("skor_maks")}</th>
                                        <th style={{ padding:"11px 16px", fontSize:10, fontWeight:700, textTransform:"", color:C.muted, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>{t("skor_diperoleh")}</th>
                                        <th style={{ padding:"11px 16px", fontSize:10, fontWeight:700, textTransform:"", color:C.muted, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>{t("capaian")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.chart_data?.map((d: any, i: number) => (
                                        <tr key={i}>
                                            <td style={{ padding:"12px 16px", fontSize:12, fontWeight:700, color:C.fg, borderBottom:`1px solid ${C.border}` }}>{d.dimension}</td>
                                            <td style={{ padding:"12px 16px", fontSize:12, color:C.fg, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>{d.fullMark}</td>
                                            <td style={{ padding:"12px 16px", fontSize:12, fontWeight:700, color:C.primary, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>{d.score}</td>
                                            <td style={{ padding:"12px 16px", fontSize:12, color:C.muted, textAlign:"center", borderBottom:`1px solid ${C.border}` }}>
                                                {Math.round((d.score / d.fullMark) * 100)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* RECOMMENDATIONS */}
                        <p style={{ fontSize:10, fontWeight:800, textTransform:"", letterSpacing:"1.2px", color:C.muted, marginBottom:12 }}>{t("rekomendasi_intervensi")}</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {data.recommendations?.map((rec: any, i: number) => (
                                <div key={i} style={{ background:C.bg, borderRadius:12, padding:"16px", border:`1px solid ${C.border}`, borderLeft:`4px solid ${rec.priority === 'high' ? C.danger : C.warning}` }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                        <span style={{ fontSize:11, fontWeight:800, textTransform:"", color:C.primary }}>{rec.category?.name}</span>
                                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", background:"rgba(0,0,0,0.05)", borderRadius:4, color:C.muted }}>GAP: {rec.gap_score}</span>
                                    </div>
                                    <p style={{ fontSize:12, color:C.fg, lineHeight:1.6 }}>{rec.recommendation_text}</p>
                                </div>
                            ))}
                            {(!data.recommendations || data.recommendations.length === 0) && (
                                <p style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>{t("tidak_ada_rekomendasi_spesifik_skor_suda")}</p>
                            )}
                        </div>

                        {/* ── FOOTER ─────────────────────────────────────── */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:40, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                            <div>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                    <div style={{ width:28, height:28, borderRadius:8, background:"white", border: `1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", padding: 4 }}>
                                        <img src="/images/logos/logo-mango.png" alt="MANGO Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    </div>
                                    <span style={{ fontWeight:800, fontSize:13, color:C.primary }}>{t("mango_1")}</span>
                                </div>
                                <p style={{ fontSize:10, color:C.muted, lineHeight:1.6 }}>Dokumen ini diterbitkan secara elektronik.<br />{t("sah_tanpa_tanda_tangan_basah")}</p>
                                <p style={{ fontSize:10, color:C.muted, marginTop:4 }}>Dicetak: {new Date().toLocaleString("id-ID")}</p>
                            </div>
                            
                            <div style={{ textAlign:"center", flexShrink:0 }}>
                                <div style={{
                                    padding:8, borderRadius:10, border:"1px solid #e2e8f0",
                                    background:"white", display:"inline-block",
                                }}>
                                    <QRCodeSVG
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/id/document/assessment/${data.id}` : `https://mango-polman.vercel.app/id/document/assessment/${data.id}`}
                                        size={72}
                                        bgColor="white"
                                        fgColor="#1e477e"
                                        level="M"
                                    />
                                </div>
                                <p style={{ fontSize:9, color:"#94a3b8", margin:"4px 0 0", fontWeight:600 }}>Scan untuk verifikasi</p>
                            </div>
                        </div>

                        <div style={{ height:4, borderRadius:99, background:`linear-gradient(90deg, ${C.primary}, ${C.accent})`, marginTop:28 }} />
                    </div>
                </div>

                <div className="no-print" style={{ textAlign:"center", marginTop:24, marginBottom:32 }}>
                    <p style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
                        Klik tombol <strong>Unduh PDF</strong> di atas untuk menyimpan dokumen ini.
                    </p>
                </div>
            </div>
        </>
    );
}
