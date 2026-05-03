"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Search, Filter, MapPin, Phone, 
  ArrowUpRight, Package, Tag, Building2,
  ChevronRight, LayoutGrid, List, Zap, Loader2
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
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
  umkm?: {
    name: string;
    regency: string;
    slug: string;
    logo_url: string;
  };
}

export const PublicProductCatalogView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const sectors = [
    { value: "all", label: "Semua Sektor" },
    { value: "Manufaktur", label: "Manufaktur" },
    { value: "Tekstil", label: "Tekstil" },
    { value: "Makanan & Minuman", label: "Makanan & Minuman" },
    { value: "Kreatif", label: "Kreatif" },
    { value: "Teknologi", label: "Teknologi" },
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    let url = `/v1/public/products?per_page=12&sort_by=${sortBy}&sort_dir=${sortDir}`;
    
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
    if (sectorFilter !== "all") url += `&sector=${encodeURIComponent(sectorFilter)}`;

    api.get(url)
      .then(res => setProducts(res.data.data || []))
      .catch(err => console.error("Gagal memuat produk:", err))
      .finally(() => setLoading(false));
  }, [debouncedSearch, sectorFilter, sortBy, sortDir]);

  return (
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header & Main Search */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4"
              >
                <Package size={14} /> Katalog IKM Terverifikasi
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-bold text-foreground uppercase tracking-tight"
              >
                Solusi <span className="text-primary">Produk</span> & Industri
              </motion.h1>
            </div>

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                type="text"
                placeholder="Cari nama produk atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 p-6 bg-card border border-border/50 rounded-[2rem] shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Filter Sektor</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSectorFilter(s.value)}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                      sectorFilter === s.value
                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-background border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
               <span className="text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Urutkan</span>
               <select 
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split("-");
                  setSortBy(key);
                  setSortDir(dir);
                }}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
               >
                 <option value="created_at-desc">Terbaru</option>
                 <option value="price-asc">Harga Terendah</option>
                 <option value="price-desc">Harga Tertinggi</option>
                 <option value="name-asc">Nama (A-Z)</option>
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
              <h3 className="text-xl font-bold text-foreground mb-2">Produk tidak ditemukan</h3>
              <p className="text-muted-foreground">Coba gunakan kata kunci lain atau jelajahi kategori utama kami.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-card rounded-[2.5rem] overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm">
                      {product.sku}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">
                            {product.name}
                        </h3>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-6 font-medium">
                        {product.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Estimasi Harga</p>
                            <p className="text-lg font-bold text-foreground">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                            </p>
                        </div>
                        <Link href={`/umkm/${product.umkm?.slug}`}>
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform">
                                <ArrowUpRight size={20} />
                            </div>
                        </Link>
                    </div>
                  </div>

                  {/* UMKM Footer */}
                  {product.umkm && (
                    <Link href={`/umkm/${product.umkm.slug}`} className="px-8 pb-8 flex items-center gap-3 group/umkm">
                        <img 
                            src={product.umkm.logo_url || `https://ui-avatars.com/api/?name=${product.umkm.name}&background=random`} 
                            alt={product.umkm.name}
                            className="w-8 h-8 rounded-lg object-cover border border-border"
                        />
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-foreground uppercase truncate group-hover/umkm:text-primary transition-colors">
                                {product.umkm.name}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                                <MapPin size={10} /> {product.umkm.regency}
                            </p>
                        </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};