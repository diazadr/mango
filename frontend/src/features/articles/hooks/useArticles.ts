import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleService } from "../services/articleService";
import { articleSchema, ArticleFormData } from "../schema/articleSchema";

export const useArticles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      category: "General",
      status: "draft",
      excerpt: "",
      content: "",
      cover_image: "",
    },
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articleService.getArticles({
        search: searchTerm || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        sort_by: sortKey,
        sort_dir: sortOrder,
      });
      setArticles(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch articles", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, sortKey, sortOrder]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchArticles, 400);
    return () => clearTimeout(delay);
  }, [fetchArticles]);

  const onSubmit = async (data: ArticleFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("status", data.status);
      formData.append("content", data.content);
      if (data.excerpt) formData.append("excerpt", data.excerpt);
      
      if (data.cover_image instanceof File) {
        formData.append("cover_image", data.cover_image);
      }

      if (editingArticle) {
        formData.append("_method", "PUT");
        await articleService.updateArticle(editingArticle.id, formData);
        setStatus({ type: "success", message: "Article updated successfully" });
      } else {
        await articleService.createArticle(formData);
        setStatus({ type: "success", message: "Article created successfully" });
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to save article" });
      console.error("Failed to save article", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setStatus(null);
    try {
      await articleService.deleteArticle(deleteConfirmId);
      setStatus({ type: "success", message: "Article deleted successfully" });
      setDeleteConfirmId(null);
      fetchArticles();
    } catch (err: any) {
      setStatus({ type: "destructive", message: "Failed to delete article" });
      console.error("Failed to delete article", err);
    }
  };

  const openCreate = () => {
    setEditingArticle(null);
    form.reset({
      title: "",
      category: "General",
      status: "draft",
      excerpt: "",
      content: "",
      cover_image: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (article: any) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      category: article.category,
      status: article.status,
      excerpt: article.excerpt || "",
      content: article.content,
      cover_image: article.cover_image || "",
    });
    setIsModalOpen(true);
  };

  return {
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
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
    deleteConfirmId,
    setDeleteConfirmId,
    openCreate,
    openEdit,
    refresh: fetchArticles,
    status,
    setStatus,
  };
};
