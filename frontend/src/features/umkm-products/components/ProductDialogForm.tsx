"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Save, Loader2, Package, Hash, CircleDollarSign, Box, ImageIcon, Camera, Maximize, Weight, Info } from "lucide-react";
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
import { ProductFormData } from "../schema/productSchema";

interface ProductDialogFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: any;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  t: any;
}

export const ProductDialogForm = ({
  form,
  onSubmit,
  isSubmitting,
  isOpen,
  onOpenChange,
  editingProduct,
  imagePreview,
  setImagePreview,
  setSelectedFile,
  t,
}: ProductDialogFormProps) => {
  const { register, formState: { errors } } = form;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-muted/30 border-b p-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Package size={24} />
            </div>
            <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-primary leading-none">
                    {editingProduct ? "Edit produk" : "Daftarkan produk baru"}
                </DialogTitle>
                <DialogDescription className="font-medium mt-1">
                    Informasi lengkap produk merchant untuk katalog industri.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Image Upload */}
            <div className="flex flex-col items-center">
                <div 
                    className="w-full h-48 rounded-[2rem] border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                    onClick={() => document.getElementById('product-image')?.click()}
                >
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="text-white" size={32} />
                            </div>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="text-muted-foreground opacity-30 mb-2" size={40} />
                            <p className="text-xs font-bold text-muted-foreground">Klik untuk unggah foto produk</p>
                        </>
                    )}
                    <input 
                        id="product-image" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">Nama Produk</Label>
                <div className="relative">
                  <Box className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      {...register("name")} 
                      className="pl-11 h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                      placeholder="Contoh: Kain Denim Premium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">Deskripsi Produk</Label>
                <Textarea 
                    {...register("description")} 
                    className="rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all min-h-[100px] font-medium" 
                    placeholder="Jelaskan detail spesifikasi produk Anda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Kode SKU</Label>
                  <Input 
                    {...register("sku")} 
                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-mono font-bold uppercase" 
                    placeholder="SKU-001" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Satuan</Label>
                  <select 
                    {...register("unit")}
                    className="flex h-12 w-full rounded-2xl border-transparent bg-muted/20 px-3 py-2 text-sm font-bold focus:bg-background transition-all"
                  >
                    <option value="pcs">Pcs</option>
                    <option value="kg">Kg</option>
                    <option value="meter">Meter</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Harga Satuan (Rp)</Label>
                  <Input 
                    {...register("price", { valueAsNumber: true })} 
                    type="number" 
                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Stok Minimum (Alert)</Label>
                  <Input 
                    {...register("min_stock_level", { valueAsNumber: true })} 
                    type="number" 
                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Dimensi (PxLxT cm)</Label>
                  <Input 
                    {...register("dimensions")} 
                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                    placeholder="10x10x5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Berat (kg)</Label>
                  <Input 
                    {...register("weight", { valueAsNumber: true })} 
                    type="number" 
                    step="0.01"
                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0">
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 rounded-2xl font-bold gap-2 bg-primary shadow-lg shadow-primary/20"
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
