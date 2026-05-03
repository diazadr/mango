"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/src/lib/http/axios";
import { Loader2, FileText, Download, Printer } from "lucide-react";
import { Button } from "@/src/components/ui/button";

// Symmetrical Document Colors
const C = {
    primary: "#1e477e",
    fg: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    bg: "#f8fafc",
    white: "#ffffff",
    success: "#22c55e"
};

export default function UmkmResumeDocument() {
    const params = useParams();
    const [umkm, setUmkm] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/v1/umkm/${params.id}`);
                setUmkm(res.data.data || res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchData();
    }, [params.id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
    );

    if (!umkm) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="font-bold text-slate-400">Dokumen tidak ditemukan.</p>
        </div>
    );

    const profile = umkm.profile || {};

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 print:p-0 print:bg-white">
            {/* Toolbar for Screen only */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-white">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-800 leading-none">Resume Bisnis</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sistem Informasi MANGO</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline" className="rounded-xl font-bold bg-white">
                        <Printer size={16} className="mr-2" /> Cetak / PDF
                    </Button>
                </div>
            </div>

            {/* A4 Page Layout */}
            <div 
                className="mx-auto bg-white shadow-2xl print:shadow-none"
                style={{ 
                    width: "210mm", 
                    minHeight: "297mm", 
                    padding: "20mm",
                    position: "relative"
                }}
            >
                {/* Decorative Elements */}
                <div style={{ position:"absolute", top:0, right:0, width:150, height:150, background:C.primary, opacity:0.03, clipPath:"polygon(100% 0, 0 0, 100% 100%)" }} />
                
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40, borderBottom:`2px solid ${C.primary}`, paddingBottom:24 }}>
                    <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                        <div style={{ width:80, height:80, background:C.bg, borderRadius:16, display:"flex", itemsCenter:"center", justifyContent:"center", overflow:"hidden", border:`1px solid ${C.border}` }}>
                            {umkm.logo_url && !umkm.logo_url.includes('placeholders') ? (
                                <img src={umkm.logo_url} alt="Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            ) : (
                                <span style={{ fontSize:32, fontWeight:900, color:C.primary }}>{umkm.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 style={{ fontSize:28, fontWeight:900, color:C.fg, lineHeight:1, marginBottom:4 }}>{umkm.name}</h1>
                            <p style={{ fontSize:12, fontWeight:700, color:C.primary, textTransform:"uppercase", letterSpacing:"1px" }}>{umkm.registration_number}</p>
                            <p style={{ fontSize:12, color:C.muted, marginTop:4 }}>{umkm.address}, {umkm.village}, {umkm.district}</p>
                        </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                        <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase" }}>Dokumen Resmi</p>
                        <p style={{ fontSize:14, fontWeight:900, color:C.primary }}>MANGO ECOSYSTEM</p>
                        <p style={{ fontSize:10, color:C.muted }}>Dicetak: {new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div style={{ display:"grid", gap:32 }}>
                    
                    {/* 1. DATA IDENTITAS */}
                    <div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                            <div>
                                <h3 style={{ fontSize:14, fontWeight:800, color:C.primary, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Informasi Umum</h3>
                                <p style={{ fontSize:14, color:C.muted, fontWeight:500 }}>
                                    Pemilik: <span style={{ color:C.fg }}>{umkm.user?.name || "-"}</span>
                                </p>
                            </div>
                            <div style={{ background:"rgba(34,197,94,0.1)", color:C.success, padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:800, textTransform:"uppercase" }}>
                                {umkm.is_active ? "Status: AKTIF" : "Status: NONAKTIF"}
                            </div>
                        </div>

                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32 }}>
                            <div style={{ background:C.bg, padding:16, borderRadius:12 }}>
                                <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Sektor Usaha</p>
                                <p style={{ fontSize:14, fontWeight:700, color:C.fg }}>{umkm.sector || "-"}</p>
                            </div>
                            <div style={{ background:C.bg, padding:16, borderRadius:12 }}>
                                <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Tahun Berdiri</p>
                                <p style={{ fontSize:14, fontWeight:700, color:C.fg }}>{umkm.established_year || "-"}</p>
                            </div>
                            <div style={{ background:C.bg, padding:16, borderRadius:12 }}>
                                <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Jml Karyawan</p>
                                <p style={{ fontSize:14, fontWeight:700, color:C.fg }}>{umkm.employee_count ? `${umkm.employee_count} Orang` : "-"}</p>
                            </div>
                            <div style={{ background:C.bg, padding:16, borderRadius:12 }}>
                                <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>NIB</p>
                                <p style={{ fontSize:14, fontWeight:700, color:C.fg }}>{umkm.nib || "-"}</p>
                            </div>
                            <div style={{ background:C.bg, padding:16, borderRadius:12, gridColumn:"span 2" }}>
                                <p style={{ fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Asal Organisasi / Pembina</p>
                                <p style={{ fontSize:14, fontWeight:700, color:C.fg }}>{umkm.organization?.name || "UMKM Mandiri"}</p>
                            </div>
                        </div>

                        {/* 2. STRATEGIC PROFILE */}
                        <div style={{ marginBottom:32 }}>
                            <h3 style={{ fontSize:14, fontWeight:800, color:C.primary, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12, borderBottom:`1px solid ${C.border}`, paddingBottom:8 }}>Profil Strategis</h3>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                                <div>
                                    <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Produk Unggulan</p>
                                    <p style={{ fontSize:13, color:C.fg, lineHeight:1.5 }}>{profile?.main_product || "Belum diisi"}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Target Pasar</p>
                                    <p style={{ fontSize:13, color:C.fg, lineHeight:1.5 }}>{profile?.market_target || "Belum diisi"}</p>
                                </div>
                                <div style={{ gridColumn:"span 2", marginTop:8 }}>
                                    <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>Deskripsi Usaha</p>
                                    <p style={{ fontSize:13, color:C.fg, lineHeight:1.6 }}>{umkm.description || "Informasi deskripsi belum tersedia."}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. CORE STATEMENTS */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:32 }}>
                            <div style={{ background:C.bg, padding:20, borderRadius:16, borderLeft:`4px solid ${C.primary}` }}>
                                <h4 style={{ fontSize:10, fontWeight:900, color:C.primary, textTransform:"uppercase", marginBottom:8 }}>Visi Bisnis</h4>
                                <p style={{ fontSize:12, color:C.fg, fontStyle:"italic", lineHeight:1.6 }}>"{profile?.vision || 'Membangun masa depan yang lebih baik.'}"</p>
                            </div>
                            <div style={{ background:C.bg, padding:20, borderRadius:16, borderLeft:`4px solid ${C.primary}` }}>
                                <h4 style={{ fontSize:10, fontWeight:900, color:C.primary, textTransform:"uppercase", marginBottom:8 }}>Misi Bisnis</h4>
                                <p style={{ fontSize:12, color:C.fg, lineHeight:1.6 }}>{profile?.mission || 'Memberikan kualitas terbaik bagi pelanggan.'}</p>
                            </div>
                        </div>

                        {/* 4. PRODUCTION INFO */}
                        <div style={{ marginBottom:32 }}>
                            <h3 style={{ fontSize:14, fontWeight:800, color:C.primary, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12, borderBottom:`1px solid ${C.border}`, paddingBottom:8 }}>Informasi Operasional</h3>
                            <div style={{ background:C.bg, padding:20, borderRadius:16 }}>
                                <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:8 }}>Alur Produksi (Workflow)</p>
                                <p style={{ fontSize:13, color:C.fg, lineHeight:1.6 }}>{profile?.production_workflow || "Informasi alur produksi internal sistem."}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Footer */}
                <div style={{ position:"absolute", bottom:"20mm", left:"20mm", right:"20mm", borderTop:`1px solid ${C.border}`, paddingTop:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <p style={{ fontSize:10, color:C.muted }}>ID Dokumen: <strong>{umkm.uuid?.substring(0,8).toUpperCase()}</strong></p>
                    <p style={{ fontSize:10, color:C.muted }}>Generated by <strong>MANGO Industrial Platform</strong></p>
                    <p style={{ fontSize:10, color:C.muted }}>Halaman 1 / 1</p>
                </div>
            </div>

            {/* Print Specific CSS */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        background: white;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
