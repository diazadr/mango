import React from "react";
import { Metadata } from "next";
import { Package, MapPin, Tag, Globe, ShieldCheck, Factory, Zap, Droplets } from "lucide-react";
import api from "@/src/lib/http/axios";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";

// This is a server component to help with SEO
async function getUmkmData(slug: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/umkms/${slug}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!res.ok) return null;
        return (await res.json()).data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const umkm = await getUmkmData(params.slug);
    if (!umkm) return { title: "UMKM Not Found | MANGO" };

    return {
        title: `${umkm.name} | Ekosistem MANGO`,
        description: umkm.profile?.mission || `Profil bisnis ${umkm.name} di platform MANGO.`,
        openGraph: {
            images: [umkm.logo_url || "/images/placeholders/company.png"]
        }
    };
}

export default async function PublicUmkmProfilePage({ params }: { params: { slug: string } }) {
    const umkm = await getUmkmData(params.slug);

    if (!umkm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">404</h1>
                    <p className="text-muted-foreground">UMKM tidak ditemukan dalam radar kami.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            {/* Hero Header */}
            <div className="bg-white border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20" />
                <div className="max-w-7xl mx-auto px-6 py-16 relative">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0 flex items-center justify-center">
                            {umkm.logo_url && !umkm.logo_url.includes('placeholders') ? (
                                <img src={umkm.logo_large || umkm.logo_url} alt={umkm.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-6xl uppercase">
                                    {umkm.name?.charAt(0) || "M"}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Badge className="bg-success/10 text-success border-success/20 rounded-lg font-bold px-3 py-1">
                                    <ShieldCheck size={12} className="mr-1" /> Terverifikasi MANGO
                                </Badge>
                                <Badge variant="outline" className="rounded-lg font-bold px-3 py-1">
                                    {umkm.sector}
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{umkm.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><MapPin size={16} /> {umkm.regency}, {umkm.province}</span>
                                <span className="flex items-center gap-1"><Tag size={16} /> {umkm.legal_entity_type}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-border/50">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary"><Globe size={20} /></div>
                            Tentang Bisnis
                        </h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Visi</p>
                                <p className="text-sm font-medium leading-relaxed italic">"{umkm.profile?.vision || 'Membangun masa depan yang lebih baik.'}"</p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Misi</p>
                                <p className="text-sm font-medium leading-relaxed">{umkm.profile?.mission || 'Memberikan kualitas terbaik bagi pelanggan.'}</p>
                            </div>
                        </div>
                        <Separator className="my-8 opacity-50" />
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Alur Produksi</p>
                            <p className="text-sm font-medium leading-relaxed">{umkm.profile?.production_workflow || 'Informasi alur produksi internal.'}</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 px-4">
                            <div className="p-2 rounded-xl bg-accent/10 text-accent"><Package size={20} /></div>
                            Katalog Produk
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {umkm.products?.map((product: any) => (
                                <Card key={product.id} className="rounded-[2rem] overflow-hidden border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="h-40 bg-muted/30 relative">
                                        <img src={product.image_large || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border-none shadow-sm">
                                            {product.sku}
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-2">
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                                        <div className="pt-2">
                                            <p className="text-sm font-bold text-success">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <Card className="bg-primary border-none rounded-[2.5rem] shadow-lg shadow-primary/20">
                        <CardContent className="p-8 text-white space-y-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold">Butuh Konsultasi?</h3>
                            <p className="text-sm text-white/80 leading-relaxed">Hubungi unit pengelola kami untuk informasi kemitraan dengan UMKM ini.</p>
                            <div className="pt-4">
                                <Badge className="bg-white text-primary rounded-xl px-6 py-2 font-bold cursor-pointer hover:bg-white/90">Hubungi Admin</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
