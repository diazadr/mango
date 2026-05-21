import React from "react";
import { 
    Package, MapPin, Tag, Globe, ShieldCheck, 
    Calendar, MessageCircle, Share2, ExternalLink, 
    Clock, Building2, Info, BadgeCheck, Phone, Mail
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";

export function PublicUmkmProfileView({ umkm, slug, t }: { umkm: any; slug: string; t: any }) {
    if (!umkm) {
        return (
            <PublicLayout>
                <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-background text-center px-6">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={32} className="text-muted-foreground/40" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">{t("not_found")}</h1>
                    <p className="text-muted-foreground max-w-md mb-2">{t("not_found_desc")}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mb-8">Slug: {slug}</p>
                    <a href="/">
                        <Button variant="outline" className="rounded-xl">{t("kembali_ke_beranda")}</Button>
                    </a>
                </div>
            </PublicLayout>
        );
    }

    const operatingHours = umkm.operating_hours || {};
    const days = [
        { key: 'monday', label: 'Senin' },
        { key: 'tuesday', label: 'Selasa' },
        { key: 'wednesday', label: 'Rabu' },
        { key: 'thursday', label: 'Kamis' },
        { key: 'friday', label: 'Jumat' },
        { key: 'saturday', label: 'Sabtu' },
        { key: 'sunday', label: 'Minggu' },
    ];

    return (
        <PublicLayout>
            <div className="min-h-screen bg-background pb-20 pt-24">
                {/* Hero Header */}
                <div className="bg-card border-b relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20" />
                    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] overflow-hidden border-4 border-background shadow-2xl bg-background flex-shrink-0 relative z-10">
                                {umkm.logo_url && !umkm.logo_url.includes('placeholders') ? (
                                    <img src={umkm.logo_large || umkm.logo_url} alt={umkm.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-7xl">
                                        {umkm.name?.charAt(0) || "M"}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 text-center md:text-left space-y-4 pb-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    {umkm.is_active && (
                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 rounded-lg font-bold px-3 py-1">
                                            <BadgeCheck size={14} className="mr-1.5" /> {t("verified")}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="rounded-lg font-bold px-3 py-1 bg-muted/50 text-foreground border-border/50">
                                        {umkm.sector || "Sektor belum diatur"}
                                    </Badge>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">{umkm.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-muted-foreground font-medium">
                                    <span className="flex items-center gap-2">
                                        <MapPin size={18} className="text-primary" /> 
                                        {[umkm.regency, umkm.province].filter(Boolean).join(", ") || umkm.address || "Lokasi belum diatur"}
                                    </span>
                                    <span className="flex items-center gap-2"><Tag size={18} className="text-primary" /> {umkm.legal_entity_type || "Badan Usaha Belum Diatur"}</span>
                                    {umkm.established_year && (
                                        <span className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> {t("established")} {umkm.established_year}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0 pb-2">
                                <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                                    <Share2 size={20} />
                                </Button>
                                {umkm.website && (
                                    <a href={umkm.website} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                                            <Globe size={20} />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* About Section */}
                        <section className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary"><Info size={22} /></div>
                                {t("about_business")}
                            </h2>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-primary tracking-wide">{t("description") || "Deskripsi Bisnis"}</p>
                                    <p className="text-base font-medium leading-relaxed text-foreground/80 border-l-4 border-primary/20 pl-6 py-1 italic">
                                        {umkm.description || "Belum ada deskripsi bisnis."}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10 pt-4">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-primary tracking-wide">{t("vision")}</p>
                                        <p className="text-sm font-semibold leading-relaxed text-foreground/70">"{umkm.profile?.vision || '-'}"</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-primary tracking-wide">{t("mission")}</p>
                                        <p className="text-sm font-semibold leading-relaxed text-foreground/70">{umkm.profile?.mission || '-'}</p>
                                    </div>
                                </div>

                                {umkm.profile?.production_workflow && (
                                    <div className="pt-6 border-t border-border/50 space-y-4">
                                        <p className="text-xs font-bold text-primary tracking-wide">{t("production_workflow")}</p>
                                        <p className="text-sm font-medium leading-relaxed text-foreground/70">{umkm.profile.production_workflow}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Product Catalog */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-2xl font-bold flex items-center gap-4">
                                    <div className="p-2.5 rounded-2xl bg-accent/10 text-accent"><Package size={22} /></div>
                                    {t("product_catalog")}
                                </h2>
                                <Badge variant="secondary" className="font-bold">{umkm.products?.length || 0} Produk</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {umkm.products?.map((product: any) => (
                                    <Card key={product.id} className="rounded-[2.5rem] overflow-hidden border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                        <div className="h-56 bg-muted/30 relative overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                               <div className="flex w-full h-full overflow-x-auto snap-x hide-scrollbar">
                                                  {product.images.map((img: any, idx: number) => (
                                                     <img key={idx} src={img.large || img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover flex-shrink-0 snap-center group-hover:scale-110 transition-transform duration-500" />
                                                  ))}
                                               </div>
                                            ) : (
                                               <img src={product.image_large || product.image_url || "/images/placeholders/product.png"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            )}
                                            <div className="absolute top-5 right-5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-mono font-black border-none shadow-sm z-10">
                                                {product.sku}
                                            </div>
                                        </div>
                                        <CardContent className="p-8 space-y-4">
                                            <h3 className="font-black text-xl group-hover:text-primary transition-colors">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed font-medium">{product.description}</p>
                                            <div className="pt-2 flex items-center justify-between">
                                                <p className="text-lg font-black text-success tracking-tight">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                                                </p>
                                                <Badge variant="outline" className="rounded-lg font-bold">{product.unit || 'pcs'}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Contact Card */}
                        <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden relative group bg-card">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/img/pattern.svg')] opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            <CardContent className="p-8 space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground">{t("contact_business")}</h3>
                                    <p className="text-sm text-muted-foreground font-medium">{t("consultation_desc") || "Hubungi kami untuk informasi lebih lanjut mengenai produk dan layanan."}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {umkm.phone && (
                                        <a href={`https://wa.me/${umkm.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block">
                                            <Button className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 font-black rounded-2xl h-14 text-base transition-all hover:-translate-y-1">
                                                <MessageCircle size={20} className="mr-3" strokeWidth={2.5} /> {t("whatsapp_us") || "Chat on WhatsApp"}
                                            </Button>
                                        </a>
                                    )}
                                    <Button variant="outline" className="w-full border-border/50 text-foreground hover:bg-muted font-black rounded-2xl h-14 text-base">
                                        <Mail size={20} className="mr-3" /> {t("contact_admin")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Info Card */}
                        <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-border/50 bg-muted/10">
                                <h3 className="font-bold flex items-center gap-3">
                                    <Building2 size={18} className="text-primary" /> {t("business_info")}
                                </h3>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <SidebarInfoItem icon={MapPin} label={t("location")} value={umkm.address} />
                                <SidebarInfoItem icon={Globe} label={t("visit_website")} value={umkm.website} isLink />
                                <SidebarInfoItem icon={Phone} label={t("contact_business")} value={umkm.phone} />
                            </CardContent>
                        </Card>

                        {/* Operating Hours */}
                        <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-border/50 bg-muted/10">
                                <h3 className="font-bold flex items-center gap-3">
                                    <Clock size={18} className="text-primary" /> {t("operating_hours")}
                                </h3>
                            </div>
                            <CardContent className="p-8">
                                <div className="space-y-3">
                                    {days.map((day) => {
                                        const hours = operatingHours[day.key] || {};
                                        return (
                                            <div key={day.key} className="flex items-center justify-between text-sm font-medium">
                                                <span className="text-muted-foreground">{day.label}</span>
                                                {hours.closed ? (
                                                    <span className="text-destructive font-bold">{t("closed")}</span>
                                                ) : (
                                                    <span className="text-foreground font-bold">{hours.open || '08:00'} - {hours.close || '17:00'}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

function SidebarInfoItem({ icon: Icon, label, value, isLink = false }: { icon: any, label: string, value?: string, isLink?: boolean }) {
    if (!value) return null;
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black text-primary tracking-wide opacity-70">{label}</p>
            <div className="flex gap-3 items-start">
                <Icon size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-foreground hover:text-primary transition-colors hover:underline break-all">
                        {value.replace(/^https?:\/\//, '')}
                    </a>
                ) : (
                    <p className="text-sm font-bold text-foreground leading-snug">{value}</p>
                )}
            </div>
        </div>
    );
}
