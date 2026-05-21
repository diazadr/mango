"use client";

import React from "react";
import { X, Calendar, User as UserIcon, Tag, Eye } from "lucide-react";
import { AdminDialog } from "@/src/components/ui/dashboard/AdminDataView";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";

interface ArticlePreviewDialogProps {
  article: any;
  onClose: () => void;
  t: any;
  tc: any;
}

export const ArticlePreviewDialog = ({
  article,
  onClose,
  t,
  tc,
}: ArticlePreviewDialogProps) => {

  if (!article) return null;

  return (
    <AdminDialog>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("detail_artikel")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t("preview_konten_dan_metadata_ar")}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Header / Cover Image */}
        <div className="space-y-4">
          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-muted relative border border-border/50">
            {article.cover_image ? (
              <img 
                src={typeof article.cover_image === 'string' ? article.cover_image : URL.createObjectURL(article.cover_image)} 
                alt={article.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-sm">{t("tidak_ada_gambar_cover")}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wider rounded-md border bg-primary/5 text-primary border-primary/20 flex items-center gap-1.5">
                <Tag size={10} />
                {article.category || "General"}
              </span>
              <StatusBadge type="status" value={article.status} />
            </div>
            <h3 className="text-2xl font-bold text-foreground leading-tight">{article.title}</h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3 border border-border/50">
            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("penulis")}</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                {article.author?.name || "Sistem"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3 border border-border/50">
            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t("tanggal_dibuat")}</p>
              <p className="text-sm font-medium text-foreground truncate">
                {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Snippet */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" />{t("cuplikan_konten")}</h4>
          <div className="bg-background rounded-xl p-4 border border-border/50 space-y-4">
            {article.excerpt && (
              <p className="text-sm font-medium text-foreground italic border-l-2 border-primary/50 pl-3 py-0.5">
                "{article.excerpt}"
              </p>
            )}
            <div 
              className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-6 prose-img:rounded-xl prose-img:w-full prose-img:object-cover"
              dangerouslySetInnerHTML={{ 
                  __html: (article.content || "Tidak ada konten.")
                      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />{t("replace_g")}<strong>$1</strong>{t("replace_g_1")}<em>$1</em>')
              }}
            />
          </div>
        </div>

      </div>
    </AdminDialog>
  );
};
