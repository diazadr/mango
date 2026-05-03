"use client";

import React from "react";
import { 
    FileText, Plus, Pencil, Trash2, CheckCircle2, Circle, Image as ImageIcon
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
  AdminSearchFilter,
  AdminSelectFilter,
  AdminToolbar,
  ConfirmDialog,
} from "@/src/components/ui/dashboard/AdminDataView";
import { 
  AdminTable, 
  AdminTableBody, 
  AdminTableCell, 
  AdminTableHeader, 
  AdminTableRow, 
  AdminTableHeadCell,
  SortableHeader
} from "@/src/components/ui/dashboard/AdminTable";
import { useArticles } from "../hooks/useArticles";
import { ArticleDialogForm } from "../components/ArticleDialogForm";

export function ArticleView() {
  const {
    articles,
    loading,
    submitting,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortKey,
    sortOrder,
    handleSort,
    isModalOpen,
    setIsModalOpen,
    editingArticle,
    form,
    onSubmit,
    handleDelete,
    deleteConfirmId,
    setDeleteConfirmId,
    openCreate,
    openEdit,
    status,
    setStatus,
  } = useArticles();

  const categoryOptions = [
    { value: "all", label: "Semua kategori" },
    { value: "News", label: "News" },
    { value: "Education", label: "Education" },
    { value: "Event", label: "Event" },
    { value: "General", label: "General" },
  ];

  return (
    <DashboardPageShell
      title="Manajemen artikel"
      subtitle="Kelola konten berita, edukasi, dan update sistem untuk komunitas MANGO."
      icon={FileText}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} /> Tulis artikel
        </Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder="Cari judul artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label="Kategori"
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm 
                  ? `Ditemukan ${articles.length} artikel untuk "${searchTerm}"` 
                  : `Total ${articles.length} artikel terdaftar`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat artikel..." />
          ) : articles.length === 0 ? (
            <EmptyState icon={FileText} title="Belum ada artikel" description="Mulai tulis artikel pertama Anda untuk dibagikan ke ekosistem." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader label="Judul artikel" sortKey="title" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell>Kategori</AdminTableHeadCell>
                  <SortableHeader label="Status" sortKey="status" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Tanggal" sortKey="created_at" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {articles.map((article) => (
                  <AdminTableRow key={article.id}>
                    <AdminTableCell>
                        <div className="flex items-center gap-3">
                            {article.cover_image ? (
                                <div className="h-10 w-14 rounded-lg overflow-hidden shrink-0 border bg-muted">
                                    <img src={article.cover_image} alt="" className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-10 w-14 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 border border-dashed">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-medium text-foreground leading-tight truncate max-w-[300px]">{article.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">ID: #{article.id}</p>
                            </div>
                        </div>
                    </AdminTableCell>
                    <AdminTableCell>
                        <StatusBadge type="custom" value={article.category} variant="info" />
                    </AdminTableCell>
                    <AdminTableCell>
                        {article.status === 'published' ? (
                            <div className="flex items-center gap-1.5 text-success text-xs font-medium">
                                <CheckCircle2 size={12} /> Published
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                                <Circle size={12} /> Draft
                            </div>
                        )}
                    </AdminTableCell>
                    <AdminTableCell>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openEdit(article)} title="Edit" tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(article.id)} title="Hapus" tone="destructive">
                          <Trash2 className="h-4 w-4" />
                        </AdminIconButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          )}
        </AdminDataCard>
      </div>

      <ArticleDialogForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={submitting}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingArticle={editingArticle}
      />

      {deleteConfirmId && (
        <ConfirmDialog
          title="Hapus artikel?"
          description="Artikel yang dihapus tidak dapat dikembalikan. Semua data terkait akan hilang permanen."
          confirmLabel="Hapus permanen"
          cancelLabel="Batal"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
