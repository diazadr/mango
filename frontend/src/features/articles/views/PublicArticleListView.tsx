"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen, Cpu, Factory, TrendingUp, Loader2, Search, Filter } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";

interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  published_at: string;
  cover_image: string;
  slug: string;
}

export const PublicArticleListView = () => {
  const t = useTranslations("ArticleSection");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const categories = [
    { value: "all", label: "Semua" },
    { value: "Education", label: "Edukasi" },
    { value: "News", label: "Berita" },
    { value: "Event", label: "Acara" },
    { value: "Technology", label: "Teknologi" },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    
    let url = `/v1/public/articles?per_page=12`;
    if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      
    api.get(url)
      .then(res => {
        setArticles(res.data.data || []);
      })
      .catch(err => console.error("Gagal mengambil artikel:", err))
      .finally(() => setLoading(false));
  }, [categoryFilter, debouncedSearch]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "technology": return <Cpu size={14} />;
      case "news": return <TrendingUp size={14} />;
      case "education": return <BookOpen size={14} />;
      case "event": return <Factory size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-bold text-foreground mb-6 uppercase tracking-tight"
            >
              Wawasan & <span className="text-primary">Edukasi</span> MANGO
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Jelajahi berbagai artikel menarik seputar transformasi digital, strategi bisnis UMKM, dan update terbaru dari ekosistem industri kami.
            </motion.p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-2 text-muted-foreground">
                <Filter size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Kategori</span>
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    categoryFilter === cat.value
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : articles.length === 0 ? (
            <div className="py-24 text-center bg-card rounded-[2.5rem] border border-dashed border-border">
              <BookOpen className="mx-auto text-muted-foreground/30 mb-4" size={48} />
              <h3 className="text-xl font-bold text-foreground mb-2">Belum ada artikel</h3>
              <p className="text-muted-foreground">Coba pilih kategori lain atau kembali lagi nanti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col group"
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="relative aspect-[16/10] overflow-hidden rounded-[2rem] mb-6 bg-muted shadow-sm"
                  >
                    <img
                      src={article.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black text-primary uppercase tracking-widest">
                        {getCategoryIcon(article.category)}
                        {article.category}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1 px-2">
                    <time className="text-[10px] font-black text-muted-foreground/60 mb-3 uppercase tracking-widest">
                      {formatDate(article.published_at)}
                    </time>

                    <Link href={`/blog/${article.slug}`}>
                      <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {article.title}
                      </h4>
                    </Link>

                    <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3 mb-6">
                      {article.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-xs font-black text-foreground flex items-center gap-1.5 group-hover:gap-2 group-hover:text-primary transition-all uppercase tracking-widest"
                      >
                        Baca Selengkapnya
                        <ArrowUpRight size={14} className="text-primary" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};