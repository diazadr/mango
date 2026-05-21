"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, MapPin, Package, Loader2, CheckCircle2, MessageCircle, Share2, Phone } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  description: string;
  slug: string;
  umkm?: {
    name: string;
    regency: string;
    province: string;
    slug: string;
    logo_url: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const PublicProductDetailView = ({ slug }: { slug: string }) => {
  const t = useTranslations("ProductDetail");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/public/products/${slug}`)
      .then(res => setProduct(res.data.data))
      .catch(err => console.error("Gagal memuat detail produk:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-32 pb-24 bg-background flex justify-center items-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-32 pb-24 bg-background flex flex-col justify-center items-center text-center px-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-muted-foreground/40" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("product_not_found")}</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            {t("product_not_found_desc")}
          </p>
          <Link href="/products" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
            {t("back_to_catalog")}
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen bg-background text-left">
        <div className="container mx-auto px-6 lg:px-12">
          
          {/* Breadcrumb & Back button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 text-sm font-medium text-muted-foreground"
          >
            <Link href="/products" className="flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft size={16} /> {t("back_to_catalog")}
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Image Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 xl:col-span-6"
            >
              <div 
                className="w-full relative bg-muted rounded-[2rem] overflow-hidden border border-border/50 shadow-sm aspect-square lg:aspect-auto lg:h-[600px]"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 60px) 0, 100% 60px, 100% 100%, 0 100%)"
                }}
              >
                <img 
                  src={product.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in"
                />
                <div className="absolute top-6 left-6 bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-xl text-xs font-black tracking-wide text-foreground shadow-sm">
                  {product.sku}
                </div>
              </div>
            </motion.div>

            {/* Details Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7 xl:col-span-6 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-tight mb-6 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-border/50">
                  <div>
                    <span className="block text-[10px] font-black text-muted-foreground tracking-wide mb-1">{t("price_estimate")}</span>
                    <span className="text-3xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                    </span>
                  </div>
                  <div className="h-12 w-px bg-border/50 hidden md:block"></div>
                  <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl border border-success/20">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold tracking-wide">{t("status_available")}</span>
                  </div>
                </div>

                <div className="prose prose-sm md:prose-base dark:prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none text-left">
                  <h3 className="text-sm font-black tracking-wide text-foreground mb-4">{t("product_description")}</h3>
                  <p className="whitespace-pre-line">{product.description || t("no_description")}</p>
                </div>
              </div>

              {/* UMKM Profile Card */}
              {product.umkm && (
                <div className="mt-auto pt-8 border-t border-border/50">
                  <h3 className="text-xs font-black tracking-wide text-muted-foreground mb-6">{t("produced_by")}</h3>
                  
                  <div className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                      <img 
                        src={product.umkm.logo_url || `https://ui-avatars.com/api/?name=${product.umkm.name}&background=random`} 
                        alt={`Logo ${product.umkm.name}`}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-border/50 shadow-sm"
                      />
                      <div className="flex-1">
                        <h4 className="text-xl font-heading font-bold tracking-tight text-foreground mb-2">
                          {product.umkm.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {product.umkm.regency}, {product.umkm.province}</span>
                          <span className="flex items-center gap-1.5"><Phone size={14} /> {product.umkm.phone || t("phone_not_set")}</span>
                        </div>
                      </div>
                      
                      <Link href={`/umkm/${product.umkm.slug}`} className="w-full sm:w-auto px-6 py-3 bg-foreground text-background rounded-xl text-sm font-bold tracking-wide hover:bg-primary hover:text-primary-foreground transition-all text-center shrink-0">
                        {t("view_profile")}
                      </Link>
                    </div>
                    
                    {product.umkm.address && (
                      <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground border border-border/30">
                        <span className="block font-semibold text-foreground mb-1">{t("full_address")}:</span>
                        {product.umkm.address}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        <Button 
                            onClick={() => window.open(`https://wa.me/${product.umkm?.phone?.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(product.umkm?.name || '')},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.name)}`, '_blank')}
                            className="h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba56] text-white font-bold gap-2 shadow-lg shadow-green-500/10 border-none"
                        >
                            <MessageCircle size={18} /> {t("chat_whatsapp")}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: product.name,
                                        text: t("share_text", { product: product.name, company: product.umkm?.name || "" }),
                                        url: window.location.href,
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success(t("link_copied"));
                                }
                            }}
                            className="h-12 rounded-xl font-bold gap-2 border-border/50 hover:bg-muted"
                        >
                            <Share2 size={18} /> {t("share_product")}
                        </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
        </div>
      </div>
    </PublicLayout>
  );
};
