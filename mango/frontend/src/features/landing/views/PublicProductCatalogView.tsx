"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Search, Filter, MapPin, 
  Loader2
} from "lucide-react";
import { api } from "@/src/lib/http/axios";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";
import { Badge } from "@/src/components/ui/badge";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  description: string;
  slug?: string;
  umkm?: {
    name: string;
    regency: string;
    province?: string;
    address?: string;
    slug: string;
    logo_url: string;
  };
}

export const PublicProductCatalogView = () => {
  const t = useTranslations("PublicProductCatalogView");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const sectors = [
    { value: "all", label: t("all_sectors") },
    { value: "Manufaktur", label: t("sectors.manufacturing") },
    { value: "Tekstil", label: t("sectors.textile") },
    { value: "Makanan & Minuman", label: t("sectors.food_beverage") },
    { value: "Kreatif", label: t("sectors.creative") },
    { value: "Teknologi", label: t("sectors.technology") },
  ];

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    let url = `/v1/public/products?page=${page}&per_page=12&sort_by=${sortBy}&sort_dir=${sortDir}`;
    
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
    if (sectorFilter !== "all") url += `&sector=${encodeURIComponent(sectorFilter)}`;

    api.get(url)
      .then(res => {
          setProducts(res.data.data || []);
          if (res.data.meta) {
              setTotalPages(res.data.meta.last_page || 1);
          }
      })
      .catch(err => console.error("Gagal memuat produk:", err))
      .finally(() => setLoading(false));
  }, [debouncedSearch, sectorFilter, sortBy, sortDir, page]);

  return (
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header & Main Search */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight"
              >
                {t.rich("title", {
                    accent: (chunks) => <span className="text-primary">{chunks}</span>
                })}
              </motion.h1>
            </div>

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 p-6 bg-card border border-border/50 rounded-[2rem] shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter size={18} />
                <span className="text-xs font-semibold tracking-wide">{t("filter_sector")}</span>
              </div>
              <select 
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sectors.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
               <span className="text-xs font-semibold tracking-wide text-muted-foreground whitespace-nowrap">{t("sort_by")}</span>
               <select 
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split("-");
                  setSortBy(key);
                  setSortDir(dir);
                }}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
               >
                 <option value="created_at-desc">{t("sort_newest")}</option>
                 <option value="price-asc">{t("sort_price_low")}</option>
                 <option value="price-desc">{t("sort_price_high")}</option>
                 <option value="name-asc">{t("sort_name_az")}</option>
               </select>
            </div>
          </div>
          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-card rounded-[3rem] border border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t("no_products")}</h3>
              <p className="text-muted-foreground">{t("no_products_desc")}</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-transparent hover:shadow-2xl hover:shadow-foreground/5 dark:hover:shadow-none transition-all duration-500 flex flex-col h-full relative text-left"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)"
                  }}
                >
                  <div 
                    className="bg-transparent flex flex-col w-full flex-1 transition-transform duration-500"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 39px) 0, 100% 39px, 100% 100%, 0 100%)"
                    }}
                  >
                    <a href={`/products/${product.slug || product.id}`} className="w-full flex flex-col flex-1 cursor-pointer focus:outline-none group/link">
                      <div className="w-full h-64 relative shrink-0 overflow-hidden bg-muted">
                        <img 
                          src={product.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black tracking-wide text-foreground shadow-sm z-20">
                          {product.sku}
                        </div>
                      </div>

                      <div className="py-6 pr-6 pl-0 flex flex-col flex-1 items-start text-left w-full relative z-10">
                        <h3 className="text-xl font-heading font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 tracking-tight mb-3">
                            {product.name}
                        </h3>

                        <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6 line-clamp-3">
                            {product.description || t("no_description")}
                        </p>

                        <div className="mt-auto w-full pt-4 border-t border-border/50 flex flex-col items-start gap-1">
                            <span className="text-[10px] font-black text-primary tracking-wide">{t("price_estimate")}</span>
                            <span className="text-lg font-bold text-foreground">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                            </span>
                        </div>
                      </div>
                    </a>

                    {product.umkm && (
                      <div className="pb-6 pt-0 pr-6 pl-0 flex items-center gap-4 bg-transparent text-left w-full mt-auto relative z-20"> 
                          <a href={`/umkm/${product.umkm.slug}`} className="flex items-center gap-4 w-full group/company hover:opacity-80 transition-opacity duration-300">
                            <img 
                                src={product.umkm.logo_url || `https://ui-avatars.com/api/?name=${product.umkm.name}&background=random`} 
                                alt={`Logo ${product.umkm.name}`}
                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-border shadow-sm"
                            />
                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                <span className="text-sm font-heading font-bold tracking-wide text-card-foreground group-hover/company:text-primary leading-tight line-clamp-1 transition-colors duration-300">
                                    {product.umkm.name}
                                </span>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <MapPin size={12} className="shrink-0" />
                                    <span className="line-clamp-1">{[product.umkm.regency, product.umkm.province].filter(Boolean).join(", ") || product.umkm.address || t("location_not_set")}</span>
                                </div>
                            </div>
                          </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-50 hover:bg-accent hover:text-white transition-colors"
                >
                  {t("prev_page")}
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  {t("page_info", { page, totalPages })}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-50 hover:bg-accent hover:text-white transition-colors"
                >
                  {t("next_page")}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};
