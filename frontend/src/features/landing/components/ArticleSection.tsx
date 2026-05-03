"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen, Cpu, Factory, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";

interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  published_at: string;
  cover_image: string;
  slug: string;
}

export const ArticleSection = () => {
  const t = useTranslations("ArticleSection");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/v1/public/articles?per_page=3")
      .then(res => {
        setArticles(res.data.data || []);
      })
      .catch(err => console.error("Gagal mengambil artikel:", err))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "business": return <TrendingUp size={14} />;
      case "production": return <Factory size={14} />;
      case "iot": return <Cpu size={14} />;
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

  if (loading) return (
    <div className="py-24 flex justify-center items-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (articles.length === 0) return null;

  return (
    <section className="py-24 bg-background" id="articles">
      <div className="container mx-auto px-6 lg:px-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground uppercase">
              {t("title_part1")} <span className="text-accent">{t("title_part2")}</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
              {t("description")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors"
            >
              {t("view_all")}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowUpRight size={18} />
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col group cursor-pointer"
            >
              <Link
                href={`/blog/${article.slug}`}
                className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 bg-muted"
              >
                <img
                  src={article.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card/90 backdrop-blur shadow-sm rounded-lg text-xs font-bold text-primary uppercase tracking-wider">
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </span>
                </div>
              </Link>

              <div className="flex flex-col flex-1">
                <time className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  {formatDate(article.published_at)}
                </time>

                <Link href={`/blog/${article.slug}`}>
                  <h4 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h4>
                </Link>

                <p className="text-muted-foreground text-sm font-sans leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-border">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-sm font-bold text-foreground flex items-center gap-1 group-hover:gap-2 group-hover:text-accent transition-all uppercase tracking-wide"
                  >
                    {t("read_more")}
                    <ArrowUpRight size={16} className="text-accent" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};