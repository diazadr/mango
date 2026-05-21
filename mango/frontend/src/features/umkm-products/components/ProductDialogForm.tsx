"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Save, Loader2, Package, ImageIcon, Trash2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ProductFormData } from "../schema/productSchema";

const MAX_IMAGES = 5;

interface ProductDialogFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: any;
  /** Gabungan URL gambar existing + preview gambar baru */
  imagePreviews: string[];
  /** Jumlah gambar yang sudah ada di server (untuk membedakan saat remove) */
  existingImagesCount?: number;
  /** @deprecated gunakan removeImage */
  setImagePreviews?: (urls: string[]) => void;
  /** @deprecated gunakan addImages */
  selectedFiles?: File[];
  /** @deprecated gunakan addImages */
  setSelectedFiles?: (files: File[]) => void;
  /** Fungsi hapus gambar (handle existing vs baru secara otomatis) */
  removeImage: (index: number) => void;
  /** Fungsi tambah gambar baru */
  addImages: (files: File[]) => void;
  t: any;
}

export const ProductDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  isOpen,
  onOpenChange,
  editingProduct,
  imagePreviews,
  existingImagesCount = 0,
  removeImage,
  addImages,
  t,
}: ProductDialogFormProps) => {
    
  const { register, formState: { errors } } = form;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addImages(files);
      // Reset input so same files can be re-selected if needed
      e.target.value = "";
    }
  };

  const canAddMore = imagePreviews.length < MAX_IMAGES;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
        <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Package size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-primary leading-none">
                {editingProduct ? "Edit produk" : "Daftarkan produk baru"}
              </DialogTitle>
              <DialogDescription className="font-medium mt-1">{t("informasi_lengkap_produk_merch")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* ── Image Upload ──────────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("foto_produk")}</Label>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {imagePreviews.length}/{MAX_IMAGES} foto
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imagePreviews.map((preview, index) => {
                  const isExisting = index < existingImagesCount;
                  return (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group"
                    >
                      <img
                        src={preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge existing vs baru */}
                      <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide ${
                        isExisting
                          ? "bg-primary/80 text-white"
                          : "bg-success/80 text-white"
                      }`}>
                        {isExisting ? "Tersimpan" : "Baru"}
                      </div>
                      {/* Tombol hapus */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1.5">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 rounded-lg shadow-lg"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Tombol tambah foto */}
                {canAddMore && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 hover:border-primary/40 transition-all group">
                    <Plus className="text-muted-foreground opacity-40 group-hover:opacity-80 group-hover:text-primary mb-1 transition-all" size={20} />
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{t("tambah")}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileInput}
                    />
                  </label>
                )}
              </div>

              {imagePreviews.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">{t("belum_ada_foto_klik_kotak_di_a")}</p>
              )}
            </div>

            {/* ── Form Fields ────────────────────────────────────────────── */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("nama_produk")}</Label>
                <Input
                  {...register("name")}
                  className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold"
                  placeholder={t("contoh_kain_denim_premium")}
                />
                {errors.name && <p className="text-xs text-destructive ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("deskripsi_produk")}</Label>
                <Textarea
                  {...register("description")}
                  className="rounded-xl bg-background border-input focus:border-primary transition-all min-h-[100px] font-medium resize-none"
                  placeholder={t("jelaskan_detail_spesifikasi_pr")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("kode_sku")}</Label>
                  <Input
                    {...register("sku")}
                    className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-mono font-bold"
                    placeholder={t("sku_001")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("satuan")}</Label>
                  <select
                    {...register("unit")}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold focus:border-primary outline-none transition-colors"
                  >
                    <option value="pcs">{t("pcs")}</option>
                    <option value="kg">Kg</option>
                    <option value="meter">{t("meter")}</option>
                    <option value="box">{t("box")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("harga_satuan_rp")}</Label>
                  <Input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("stok_minimum_alert")}</Label>
                  <Input
                    {...register("min_stock_level", { valueAsNumber: true })}
                    type="number"
                    className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("dimensi_pxlxt_cm")}</Label>
                  <Input
                    {...register("dimensions")}
                    className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold"
                    placeholder={t("10x10x5")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("berat_kg")}</Label>
                  <Input
                    {...register("weight", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            {/* ── Etalase Publik ─────────────────────────────────────────── */}
            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
              <Checkbox
                id="is_showcase"
                checked={form.watch("is_showcase")}
                onCheckedChange={(checked) => form.setValue("is_showcase", checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="is_showcase" className="font-bold text-primary">{t("tampilkan_di_etalase_publik")}</Label>
                <p className="text-xs font-medium text-muted-foreground mt-1">{t("aktifkan_opsi_ini_agar_produk_")}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-bold gap-2 bg-primary shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingProduct ? "Simpan Perubahan" : "Daftarkan Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
