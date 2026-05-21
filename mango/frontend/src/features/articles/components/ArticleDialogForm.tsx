"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { X, Save, Loader2, FileText, Type, Layers, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ArticleFormData } from "../schema/articleSchema";
import { TiptapEditor } from "@/src/components/common/TiptapEditor";
import { useState, useEffect } from "react";

interface ArticleDialogFormProps {
  form: UseFormReturn<ArticleFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: any;
}

export const ArticleDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  isOpen,
  onOpenChange,
  editingArticle,
}: ArticleDialogFormProps) => {
    const t = useTranslations("ArticleDialogForm");
    
  const { register, control, watch, formState: { errors } } = form;
  const coverImage = watch("cover_image");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (coverImage instanceof File) {
      const objectUrl = URL.createObjectURL(coverImage);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof coverImage === "string" && coverImage) {
      setPreview(coverImage);
    } else {
      setPreview(null);
    }
  }, [coverImage]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden rounded-xl p-0 border-none shadow-2xl flex flex-col">
        <DialogHeader className="bg-muted/30 border-b p-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <FileText size={24} />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-primary leading-none">
                    {editingArticle ? "Edit Artikel" : "Tulis Publikasi Baru"}
                </DialogTitle>
                <DialogDescription className="font-medium mt-1">{t("bagikan_berita_edukasi_atau_pe")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-none">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("judul_artikel")}</Label>
              <div className="relative group">
                <Type className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    {...register("title")} 
                    className="pl-11 h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" 
                    placeholder={t("contoh_tren_industri_tekstil_4")} 
                    disabled={isSubmitting} 
                />
              </div>
              {errors.title && <p className="text-xs text-destructive">{t("judul_artikel_wajib_diisi")}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("foto_sampul_artikel")}</Label>
              <div className="flex flex-col gap-3">
                {preview && (
                  <div className="relative w-full h-44 rounded-lg overflow-hidden border bg-muted/20">
                    <img 
                      src={preview} 
                      alt={t("alt_cover_preview")} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-wide rounded-lg">
                        {coverImage instanceof File ? "Pratinjau File Baru" : "Gambar Saat Ini"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="relative group">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/10 hover:border-primary/50 transition-all cursor-pointer">
                    <div className="p-3 rounded-lg bg-background shadow-sm text-primary">
                      <Upload size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {preview ? "Ganti Foto Sampul" : "Pilih Foto Sampul"}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("format_jpg_png_webp_maks_5mb")}</p>
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("cover_image", file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">{t("kategori_konten")}</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all">
                        <SelectValue placeholder={t("pilih_kategori")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="General">{t("umum")}</SelectItem>
                        <SelectItem value="Education">{t("edukasi")}</SelectItem>
                        <SelectItem value="News">{t("berita")}</SelectItem>
                        <SelectItem value="Event">{t("acara")}</SelectItem>
                        <SelectItem value="Technology">{t("teknologi")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">{t("status_publikasi")}</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all">
                        <SelectValue placeholder={t("pilih_status")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="draft">{t("draft_simpan_internal")}</SelectItem>
                        <SelectItem value="published">{t("published_siap_tayang")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("ringkasan_singkat")}</Label>
              <Textarea 
                  {...register("excerpt")} 
                  placeholder={t("gambarkan_isi_artikel_dalam_1_")} 
                  className="rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all resize-none h-20"
                  disabled={isSubmitting} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("isi_artikel_lengkap")}</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TiptapEditor 
                    content={field.value} 
                    onChange={field.onChange}
                    placeholder={t("tuliskan_seluruh_narasi_publik")}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.content && <p className="text-xs text-destructive">{t("konten_artikel_tidak_boleh_kos")}</p>}
            </div>
          </div>
        </form>

        <DialogFooter className="p-6 bg-muted/30 border-t flex gap-3 shrink-0">
          <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting} 
              className="flex-1 rounded-lg h-10 border-muted-foreground/20"
          >{t("batal")}</Button>
          <Button 
              onClick={onSubmit}
              disabled={isSubmitting} 
              className="flex-1 rounded-lg gap-2 bg-primary h-10 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingArticle ? "Perbarui Publikasi" : "Terbitkan Artikel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
