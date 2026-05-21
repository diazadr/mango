import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { productService } from "../services/productService";
import { productSchema, ProductFormData } from "../schema/productSchema";

/** Representasi gambar yang sudah tersimpan di server */
export interface ExistingImage {
  id: number;
  url: string;
  thumb?: string;
}

export const useUmkmProducts = () => {
  const t = useTranslations("ProductsPage");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  // Gambar dari server (saat edit) — disimpan terpisah agar bisa track penghapusan
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  // ID gambar existing yang akan dihapus saat submit
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  // File baru yang dipilih user
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Preview URL untuk file baru (blob URL)
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Backward compat: imagePreviews = gabungan URL existing + preview baru
  const imagePreviews = [
    ...existingImages.map((img) => img.url),
    ...newImagePreviews,
  ];

  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      unit: "pcs",
      dimensions: "",
      weight: 0,
      price: 0,
      min_stock_level: 0,
      is_active: true,
      is_showcase: false,
    },
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "1" : "0");
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Lampirkan file baru
    selectedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    // Lampirkan ID gambar yang akan dihapus (saat edit)
    removedImageIds.forEach((id, index) => {
      formData.append(`remove_image_ids[${index}]`, id.toString());
    });

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        setStatus({ type: "success", message: "Produk berhasil diperbarui." });
      } else {
        await productService.createProduct(formData);
        setStatus({ type: "success", message: "Produk berhasil ditambahkan." });
      }
      setIsModalOpen(false);
      setIsViewModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Gagal menyimpan produk." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    setStatus(null);
    try {
      await productService.deleteProduct(id);
      setStatus({ type: "success", message: "Produk berhasil dihapus." });
      setIsViewModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setStatus({ type: "destructive", message: "Gagal menghapus produk." });
    }
  };

  const _resetImageState = () => {
    setExistingImages([]);
    setRemovedImageIds([]);
    setSelectedFiles([]);
    setNewImagePreviews([]);
  };

  const openCreate = () => {
    setEditingProduct(null);
    _resetImageState();
    form.reset({
      name: "",
      description: "",
      sku: "",
      unit: "pcs",
      dimensions: "",
      weight: 0,
      price: 0,
      min_stock_level: 0,
      is_active: true,
      is_showcase: false,
    });
    setIsModalOpen(true);
  };

  const openView = (product: any) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    // Populate existing images from server data
    const imgs: ExistingImage[] = (product.images || []).map((i: any) => ({
      id: i.id,
      url: i.url || i.thumb,
      thumb: i.thumb,
    }));
    // Fallback untuk produk lama yang pakai image_url tunggal
    if (imgs.length === 0 && product.image_url) {
      imgs.push({ id: 0, url: product.image_url });
    }
    setExistingImages(imgs);
    setRemovedImageIds([]);
    setSelectedFiles([]);
    setNewImagePreviews([]);
    form.reset({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      unit: product.unit,
      dimensions: product.dimensions || "",
      weight: product.weight || 0,
      price: product.price,
      min_stock_level: product.min_stock_level || 0,
      is_active: !!product.is_active,
      is_showcase: !!product.is_showcase,
    });
    setIsModalOpen(true);
  };

  /**
   * Hapus gambar dari UI.
   * - Jika index < existingImages.length → gambar dari server, tandai untuk dihapus
   * - Jika index >= existingImages.length → gambar baru, hapus dari selectedFiles
   */
  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      const img = existingImages[index];
      if (img.id) {
        setRemovedImageIds((prev) => [...prev, img.id]);
      }
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== newIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  /**
   * Tambah file baru dari input.
   * Batasi total gambar (existing + baru) tidak melebihi 5.
   */
  const addImages = (files: File[]) => {
    const totalAllowed = 5 - existingImages.length - selectedFiles.length;
    if (totalAllowed <= 0) return;
    const toAdd = files.slice(0, totalAllowed);
    setSelectedFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    products,
    loading,
    submitting,
    isModalOpen,
    setIsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewingProduct,
    editingProduct,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
    openCreate,
    openView,
    openEdit,
    refresh: fetchProducts,
    status,
    setStatus,
    // Image state
    imagePreviews,        // gabungan (backward compat)
    existingImages,
    newImagePreviews,
    selectedFiles,
    setSelectedFiles,
    setImagePreviews: () => {}, // no-op, backward compat
    removeImage,
    addImages,
    t,
  };
};
