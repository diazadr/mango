import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { productService } from "../services/productService";
import { productSchema, ProductFormData } from "../schema/productSchema";

export const useUmkmProducts = () => {
  const t = useTranslations("ProductsPage");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
            // Convert booleans to 1/0 for Laravel compatibility in multipart
            if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    
    if (selectedFile) {
        formData.append("image", selectedFile);
    }

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

  const openCreate = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setSelectedFile(null);
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
    });
    setIsModalOpen(true);
  };

  const openView = (product: any) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setImagePreview(product.image_url || null);
    setSelectedFile(null);
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
    });
    setIsModalOpen(true);
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
    imagePreview,
    setImagePreview,
    setSelectedFile,
    t,
  };
};
