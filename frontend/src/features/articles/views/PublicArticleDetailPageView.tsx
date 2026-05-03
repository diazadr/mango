"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen, Cpu, Factory, TrendingUp, Loader2, Calendar, User, Share2 } from "lucide-react";
import { Link, useRouter } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";

interface Article {
  id: number;
  category: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  cover_image: string;
  slug: string;
  author?: {
    name: string;
  };
}

export const PublicArticleDetailPageView = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/public/articles/${slug}`)
      .then(res => {
        setArticle(res.data.data);
      })
      .catch(err => {
        console.error("Gagal mengambil detail artikel:", err);
        router.push("/blog");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

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
    <PublicLayout>
      <div className="pt-32 pb-24 min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    </PublicLayout>
  );

  if (!article) return null;

  return (
    <PublicLayout>
      <article className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-12 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Kembali ke Blog
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Calendar size={14} className="text-primary/50" />
                {formatDate(article.published_at)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <User size={14} className="text-primary/50" />
                Oleh {article.author?.name || "Tim MANGO"}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10 leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            {/* Cover Image */}
            <div className="relative aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl shadow-primary/10 border border-border">
              <img 
                src={article.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary">
               {/* 
                 In a real app, you might use a markdown renderer or dangerousInnerHtml 
                 depending on how content is stored.
               */}
               <div dangerouslySetInnerHTML={{ __html: article.content }} className="whitespace-pre-wrap font-medium" />
            </div>

            {/* Footer / Share */}
            <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bagikan artikel:</p>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              
              <Link href="/blog">
                <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold border-primary/20 text-primary hover:bg-primary/5">
                  Baca Artikel Lainnya
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};