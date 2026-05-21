"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Calendar, User, Share2 } from "lucide-react";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa6";
import { Link, useRouter } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";
import { Button } from "@/src/components/ui/button";
import PublicLayout from "@/src/components/layouts/public/PublicLayout";
import { toast } from "sonner";

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

export const PublicArticleDetailView = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const t = useTranslations("ArticleDetail");
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

  const handleShare = async () => {
    if (!article) return;
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Gagal berbagi:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("link_copied"));
      } catch (err) {
        toast.error(t("link_copy_failed"));
      }
    }
  };

  const shareOnSocial = (platform: 'wa' | 'fb' | 'tw') => {
    if (!article) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);
    
    let shareUrl = '';
    switch (platform) {
      case 'wa': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
      case 'fb': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'tw': shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
      <article className="pt-32 pb-24 min-h-screen bg-background text-left">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-12 transition-colors tracking-wide"
          >
            <ArrowLeft size={16} /> {t("back_to_blog")}
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black capitalize tracking-wide">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground tracking-wide">
                <Calendar size={14} className="text-primary/50" />
                {formatDate(article.published_at)}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground tracking-wide">
                <User size={14} className="text-primary/50" />
                {t("by_author", { name: article.author?.name || t("by_team") })}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10 leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            {/* Cover Image */}
            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl shadow-primary/10 border border-border">
              <img 
                src={article.cover_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary">
               <div 
                   dangerouslySetInnerHTML={{ 
                       __html: article.content
                           // Legacy support: Parse markdown images ![alt](url) to HTML if any old content exists
                           .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="w-full rounded-2xl my-6" />')
                           // Also parse simple bold and italic for legacy content
                           .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                   }} 
                   className="whitespace-pre-wrap font-medium" 
               />
            </div>

            {/* Footer / Share */}
            <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold text-muted-foreground tracking-wide">{t("share_article")}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => shareOnSocial('wa')}
                    className="p-2.5 rounded-xl bg-muted hover:bg-green-500 hover:text-white transition-all shadow-sm"
                    title={t("title_share_on_whatsapp")}
                  >
                    <FaWhatsapp size={16} />
                  </button>
                  <button 
                    onClick={() => shareOnSocial('fb')}
                    className="p-2.5 rounded-xl bg-muted hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title={t("title_share_on_facebook")}
                  >
                    <FaFacebook size={16} />
                  </button>
                  <button 
                    onClick={() => shareOnSocial('tw')}
                    className="p-2.5 rounded-xl bg-muted hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                    title={t("title_share_on_twitter")}
                  >
                    <FaTwitter size={16} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all shadow-sm"
                    title={t("title_share_link")}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              
              <Link href="/blog">
                <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold border-primary/20 text-primary hover:bg-primary/5">
                  {t("read_more")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};
