"use client";

import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import {
    FileText, Plus, Pencil, Trash2, CheckCircle2, Circle, Image as ImageIcon, Eye,
    BookOpen, TrendingUp, BarChart3, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
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
import { ArticlePreviewDialog } from "../components/ArticlePreviewDialog";

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

export function ArticleView() {
    const t = useTranslations("ArticleView");

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
    isPreviewOpen,
    setIsPreviewOpen,
    editingArticle,
    previewArticle,
    form,
    onSubmit,
    handleDelete,
    deleteConfirmId,
    setDeleteConfirmId,
    openCreate,
    openEdit,
    openPreview,
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

  // ── Computed stats from real article data ──────────────────────────
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const draft = articles.filter(a => a.status === 'draft').length;
    const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views_count || 0), 0);

    // Category distribution from real data
    const catMap: Record<string, number> = {};
    articles.forEach(a => {
      const cat = a.category || 'General';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(catMap).map(([name, value], i) => ({
      name,
      value,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    // Monthly trend from real data (last 6 months)
    const now = new Date();
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString('id-ID', { month: 'short' });
      const count = articles.filter(a => {
        const created = new Date(a.created_at);
        return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      }).length;
      trendData.push({ name: monthKey, published: count });
    }

    return { total, published, draft, totalViews, categoryData, trendData };
  }, [articles]);

  if (loading) {
    return (
      <DashboardPageShell title={t("manajemen_artikel")} icon={FileText}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={t("manajemen_artikel")}
      subtitle={t("kelola_konten_berita_edukasi_d")}
      icon={FileText}
      actions={
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} />{t("tulis_artikel")}</Button>
      }
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {/* ── Metric Cards ─────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Artikel"
            value={stats.total.toLocaleString()}
            trend={`${stats.draft} masih draft`}
            icon={FileText}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <MetricCard
            title="Artikel Terbit"
            value={stats.published.toLocaleString()}
            trend={`${stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% dari total`}
            trendIcon={TrendingUp}
            icon={CheckCircle2}
            iconColor="text-success"
            iconBg="bg-success/10"
          />
          <MetricCard
            title="Total Dilihat"
            value={stats.totalViews.toLocaleString()}
            trend={`${stats.categoryData.length} kategori aktif`}
            trendIcon={Eye}
            icon={Eye}
            iconColor="text-accent"
            iconBg="bg-accent/10"
            accent
          />
        </div>

        {/* ── Charts ───────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-7">
          <SectionCard
            title="Tren Publikasi"
            description="Jumlah artikel terbit per bulan (6 bulan terakhir)"
            icon={BarChart3}
            className="lg:col-span-4"
          >
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" dy={10} />
                  <YAxis tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="published"
                    name="Artikel"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--card))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Sebaran Kategori"
            description="Proporsi artikel per kategori"
            icon={BookOpen}
            className="lg:col-span-3"
          >
            {stats.categoryData.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                Belum ada data kategori
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Article Table ────────────────────────────────────────────── */}
        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("cari_judul_artikel")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("kategori")}
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
          {articles.length === 0 ? (
            <EmptyState icon={FileText} title={t("belum_ada_artikel")} description={t("mulai_tulis_artikel_pertama_an")} />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <SortableHeader label={t("judul_artikel")} sortKey="title" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell>{t("kategori")}</AdminTableHeadCell>
                  <SortableHeader label={t("status")} sortKey="status" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell>Views</AdminTableHeadCell>
                  <SortableHeader label={t("tanggal")} sortKey="created_at" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                  <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
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
                            </div>
                        </div>
                    </AdminTableCell>
                    <AdminTableCell>
                        <StatusBadge type="custom" value={article.category} variant="info" />
                    </AdminTableCell>
                    <AdminTableCell>
                        {article.status === 'published' ? (
                            <div className="flex items-center gap-1.5 text-success text-xs font-medium">
                                <CheckCircle2 size={12} />{t("published")}</div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                                <Circle size={12} />{t("draft")}</div>
                        )}
                    </AdminTableCell>
                    <AdminTableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Eye size={13} />
                          <span className="font-medium">{(article.views_count || 0).toLocaleString()}</span>
                        </div>
                    </AdminTableCell>
                    <AdminTableCell>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(article.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton onClick={() => openPreview(article)} title={t("lihat_detail")} tone="default">
                          <Eye className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => openEdit(article)} title={t("edit")} tone="primary">
                          <Pencil className="h-4 w-4" />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => setDeleteConfirmId(article.id)} title={t("hapus")} tone="destructive">
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

      {isPreviewOpen && previewArticle && (
        <ArticlePreviewDialog
          article={previewArticle}
          onClose={() => setIsPreviewOpen(false)}
          t={null}
          tc={null}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title={t("hapus_artikel")}
          description={t("artikel_yang_dihapus_tidak_dap")}
          confirmLabel={t("confirmLabel_hapus_permanen")}
          cancelLabel={t("cancelLabel_batal")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
          destructive
        />
      )}
    </DashboardPageShell>
  );
}
