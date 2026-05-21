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
  const t = useTranslations("PublicBlogListView");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("published_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: "all", label: t("all_categories") },
    { value: "Education", label: t("categories.education") },
    { value: "News", label: t("categories.news") },
    { value: "Event", label: t("categories.event") },
    { value: "Technology", label: t("categories.technology") },
    { value: "General", label: t("categories.general") },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    
    let url = `/v1/public/articles?page=${page}&per_page=12&sort_by=${sortBy}&sort_dir=${sortDir}`;
    if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      
    api.get(url)
      .then(res => {
        setArticles(res.data.data || []);
        if (res.data.meta) {
          setTotalPages(res.data.meta.last_page || 1);
        }
      })
      .catch(err => console.error("Gagal mengambil artikel:", err))
      .finally(() => setLoading(false));
  }, [categoryFilter, debouncedSearch, sortBy, sortDir, page]);

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
                <span className="text-xs font-semibold tracking-wide">{t("filter_category")}</span>
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
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
                 <option value="published_at-desc">{t("sort_newest")}</option>
                 <option value="published_at-asc">{t("sort_oldest")}</option>
                 <option value="title-asc">{t("sort_title_az")}</option>
                 <option value="title-desc">{t("sort_title_za")}</option>
               </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex justify-center items-center">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : articles.length === 0 ? (
            <div className="py-24 text-center bg-card rounded-[3rem] border border-dashed border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} className="text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t("no_articles")}</h3>
              <p className="text-muted-foreground">{t("no_articles_desc")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
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
                      <Link href={`/blog/${article.slug}`} className="w-full flex flex-col flex-1 cursor-pointer focus:outline-none group/link">
                        <div className="w-full h-64 relative shrink-0 overflow-hidden bg-muted">
                          <img 
                            src={article.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide text-primary flex items-center gap-1.5 shadow-sm z-20">
                            {getCategoryIcon(article.category)}
                            {article.category}
                          </div>
                        </div>

                        <div className="py-6 pr-6 pl-0 flex flex-col flex-1 items-start text-left w-full relative z-10">
                          <time className="text-[10px] font-black text-muted-foreground/60 mb-3 tracking-wide uppercase">
                            {formatDate(article.published_at)}
                          </time>

                          <h3 className="text-xl font-heading font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 tracking-tight mb-3">
                            {article.title}
                          </h3>

                          <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6 line-clamp-3">
                            {article.excerpt}
                          </p>

                          <span className="mt-auto w-max px-5 py-2 rounded-full border border-foreground/30 text-foreground text-sm font-semibold tracking-wide transition-colors duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white pointer-events-none flex items-center gap-2">
                            {t("read_more")}
                            <ArrowUpRight size={16} />
                          </span>
                        </div>
                      </Link>
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
