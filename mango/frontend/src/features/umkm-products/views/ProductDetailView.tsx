"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { X, Pencil, Trash2, Box, Hash, CircleDollarSign, Tag, Maximize, Weight, Info, CheckCircle2, AlertCircle, Link as LinkIcon, Copy } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/src/components/ui/dialog";

interface ProductDetailViewProps {
  product: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
}

export const ProductDetailView = ({
  product,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete
}: ProductDetailViewProps) => {
    const t = useTranslations("ProductDetailView");

  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/umkm/${product.umkm?.slug || 'profile'}/product/${product.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Detail informasi produk {product.name}</DialogDescription>
        </DialogHeader>
        <div className="relative h-64 bg-muted/30">
          {product.images && product.images.length > 0 ? (
             <div className="flex w-full h-full overflow-x-auto snap-x custom-scrollbar">
                {product.images.map((img: any, idx: number) => (
                   <img key={idx} src={img.large || img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover flex-shrink-0 snap-center" />
                ))}
             </div>
          ) : product.image_large || product.image_url ? (
             <img src={product.image_large || product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <Box size={80} />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/40 text-white z-10"
          >
            <X size={20} />
          </Button>
          
          {product.images && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {product.images.map((_: any, idx: number) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
                  ))}
              </div>
          )}
        </div>

        <div className="p-6 space-y-6 pt-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="rounded-lg font-mono text-[10px] tracking-wider">
                {product.sku}
              </Badge>
              <Badge className={`rounded-lg font-bold text-[10px] ${product.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {product.is_active ? 'Aktif di Katalog' : 'Nonaktif'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-foreground leading-tight">{product.name}</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyLink}
                    className={`rounded-xl font-bold gap-2 transition-all ${copied ? 'bg-success text-white border-success' : 'border-primary/20 text-primary'}`}
                >
                    {copied ? <CheckCircle2 size={14} /> : <LinkIcon size={14} />}
                    {copied ? 'Tersalin' : 'Salin Link SEO'}
                </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("deskripsi_produk")}</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {product.description || "Tidak ada deskripsi produk tersedia."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                  <CircleDollarSign size={10} />{t("harga")}</p>
                <p className="text-sm font-bold text-success">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                  <Tag size={10} />{t("satuan")}</p>
                <p className="text-sm font-bold text-foreground">{product.unit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                  <Maximize size={10} />{t("dimensi")}</p>
                <p className="text-sm font-bold text-foreground">{product.dimensions || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                  <Weight size={10} />{t("berat")}</p>
                <p className="text-sm font-bold text-foreground">{product.weight ? `${product.weight} kg` : "—"}</p>
              </div>
            </div>

            <div className="bg-muted/10 p-4 rounded-xl border border-border/50 flex items-center gap-3">
               <div className={`p-2 rounded-xl ${product.min_stock_level > 0 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                  <Info size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-wide">{t("stok_minimum_alert")}</p>
                  <p className="text-sm font-bold">{product.min_stock_level || 0} {product.unit}</p>
               </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-6 border-t border-border/50 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
                onOpenChange(false);
                setTimeout(() => onEdit(product), 200);
            }}
            className="flex-1 rounded-xl h-11 font-bold gap-2"
          >
            <Pencil size={18} />{t("edit_data")}</Button>
          <Button 
            variant="ghost" 
            onClick={() => onDelete(product.id)}
            className="rounded-xl h-11 w-11 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={20} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
