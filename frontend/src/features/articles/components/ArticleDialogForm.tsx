"use client";

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
  const { register, control, formState: { errors } } = form;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden rounded-[2rem] p-0 border-none shadow-2xl flex flex-col">
        <DialogHeader className="bg-muted/30 border-b p-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText size={24} />
            </div>
            <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary leading-none">
                    {editingArticle ? "Edit Artikel" : "Tulis Publikasi Baru"}
                </DialogTitle>
                <DialogDescription className="font-medium mt-1">
                    Bagikan berita, edukasi, atau pengumuman ke seluruh ekosistem.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-none">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Judul Artikel</Label>
              <div className="relative group">
                <Type className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    {...register("title")} 
                    className="pl-11 h-12 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold text-foreground" 
                    placeholder="Contoh: Tren Industri Tekstil 4.0 di Indonesia" 
                    disabled={isSubmitting} 
                />
              </div>
              {errors.title && <p className="text-[10px] font-bold text-destructive px-1">Judul artikel wajib diisi.</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Foto Sampul Artikel</Label>
              <div className="flex flex-col gap-3">
                {editingArticle?.cover_image && (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border bg-muted/20">
                    <img 
                      src={editingArticle.cover_image} 
                      alt="Current Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest">Gambar Saat Ini</p>
                    </div>
                  </div>
                )}
                <div className="relative group">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/10 hover:border-primary/50 transition-all cursor-pointer">
                    <div className="p-3 rounded-xl bg-background shadow-sm text-primary">
                      <Upload size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Pilih File Foto Baru</p>
                      <p className="text-[10px] font-medium text-muted-foreground">Format: JPG, PNG, WEBP (Maks. 5MB)</p>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kategori Konten</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="h-11 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Edukasi">Edukasi</SelectItem>
                        <SelectItem value="Berita">Berita</SelectItem>
                        <SelectItem value="Update">Update Sistem</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status Publikasi</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <SelectTrigger className="h-11 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="draft">Draft (Simpan Internal)</SelectItem>
                        <SelectItem value="published">Published (Siap Tayang)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ringkasan Singkat</Label>
              <Textarea 
                  {...register("excerpt")} 
                  placeholder="Gambarkan isi artikel dalam 1-2 kalimat untuk pratinjau di dashboard..." 
                  className="rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all resize-none h-20"
                  disabled={isSubmitting} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Isi Artikel Lengkap</Label>
              <Textarea 
                  {...register("content")} 
                  placeholder="Tuliskan seluruh narasi publikasi Anda di sini secara detail..." 
                  className="min-h-[250px] rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all leading-relaxed"
                  disabled={isSubmitting} 
              />
              {errors.content && <p className="text-[10px] font-bold text-destructive px-1">Konten artikel tidak boleh kosong.</p>}
            </div>
          </div>
        </form>

        <DialogFooter className="p-8 bg-muted/30 border-t flex gap-3 shrink-0">
          <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting} 
              className="flex-1 rounded-2xl font-bold h-12 border-muted-foreground/20"
          >
            Batal
          </Button>
          <Button 
              onClick={onSubmit}
              disabled={isSubmitting} 
              className="flex-1 rounded-2xl font-black uppercase text-xs tracking-widest gap-2 bg-primary h-12 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingArticle ? "Perbarui Publikasi" : "Terbitkan Artikel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
