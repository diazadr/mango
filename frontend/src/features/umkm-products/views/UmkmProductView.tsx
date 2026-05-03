"use client";

import React from "react";
import { 
    Package, Plus, Pencil, Trash2, Box, Hash, CircleDollarSign, Tag, Info
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  AdminIconButton,
  AdminToolbar,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableHeadCell,
  AdminTableRow, 
} from "@/src/components/ui/dashboard/AdminTable";
import { useUmkmProducts } from "../hooks/useUmkmProducts";
import { ProductDialogForm } from "../components/ProductDialogForm";
import { ProductDetailView } from "../components/ProductDetailView";
import { Badge } from "@/src/components/ui/badge";

export function UmkmProductView() {
  const {
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
    onSubmit,
    handleDelete,
    openCreate,
    openView,
    openEdit,
    status,
    setStatus,
    imagePreview,
    setImagePreview,
    setSelectedFile,
    t,
  } = useUmkmProducts();

  return (
    <DashboardPageShell
      title="Katalog inventaris"
      subtitle="Kelola SKU, spesifikasi produk, dan pantau stok minimum untuk kelancaran produksi."
      icon={Package}
      actions={
        <Button onClick={openCreate} className="gap-2 rounded-2xl font-bold h-11 bg-primary">
          <Plus size={18} /> Tambah produk
        </Button>
      }
    >
      <div className="space-y-8">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <div className="grid grid-cols-1 gap-8">
            {loading ? (
                <div className="h-60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : products.length === 0 ? (
                <EmptyState icon={Package} title="Belum ada produk" description="Mulai dengan menambahkan produk pertama Anda ke katalog merchant." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div 
                            key={product.id} 
                            onClick={() => openView(product)}
                            className="bg-white border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col cursor-pointer"
                        >
                            <div className="relative h-48 bg-muted/30 overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm font-mono text-[10px] border-none shadow-sm uppercase">
                                        {product.sku}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="mb-4 flex-1">
                                    <h3 className="text-xl font-bold text-foreground leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-medium h-8">{product.description || "Tidak ada deskripsi produk."}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Harga</p>
                                            <p className="text-sm font-bold text-success">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stok Min</p>
                                            <p className="text-sm font-bold text-foreground">{product.min_stock_level} {product.unit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Detail Modal */}
      <ProductDetailView 
        product={viewingProduct}
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Edit/Create Modal */}
      <ProductDialogForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={submitting}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingProduct={editingProduct}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        setSelectedFile={setSelectedFile}
        t={t}
      />
    </DashboardPageShell>
  );
}

function Loader2(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    )
}
