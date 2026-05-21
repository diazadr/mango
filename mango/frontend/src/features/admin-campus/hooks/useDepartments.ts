import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campusService } from "../services/campusService";
import { departmentService } from "../services/departmentService";
import { departmentSchema, DepartmentFormData } from "../schema/departmentSchema";
import { useAuth } from "@/src/components/providers/AuthProvider";

export const useDepartments = (perPage: number = 10) => {
  const { user } = useAuth();
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // ← baru
  const [sortKey, setSortKey] = useState("name");          // ← baru
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // ← baru
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepts, setTotalDepts] = useState(0);

  const [campus, setCampus] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [previewDept, setPreviewDept] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      institution_id: 0,
      name: "",
      description: "",
      email: "",
      phone: "",
      head_name: "",
      location: "",
      is_active: true,
    },
  });

  const fetchContext = useCallback(async () => {
    try {
      const orgRes = await campusService.getMyInstitutions();
      const organizations = orgRes.data.data || [];
      const myOrg = organizations.find((org: any) => org.type === "kampus") || organizations[0];
      if (myOrg) {
        setCampus(myOrg);
        form.setValue("institution_id", myOrg.id);
      }
    } catch (err) {
      console.error("Failed to fetch context", err);
    }
  }, [form]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    // Tidak reset status di sini agar pesan sukses sebelumnya tidak hilang saat refetch
    try {
      const params: any = { 
        page: currentPage, 
        per_page: perPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (searchTerm && searchBy !== "all") params.search_by = searchBy;
      if (campus && user && !user.is_super_admin) params.institution_id = campus.id;
      // Kirim ke API jika backend support, fallback ke client-side di bawah
      if (statusFilter !== "all") params.is_active = statusFilter;

      const { data } = await departmentService.getDepartments(params);
      const raw: any[] = data.data || [];

      // ── Client-side status filter (fallback) ──
      const filtered = statusFilter === "all"
        ? raw
        : raw.filter((d) => String(d.is_active) === statusFilter);

      // ── Client-side sorting ──
      const sorted = [...filtered].sort((a, b) => {
        // is_active: true > false saat "asc"
        if (sortKey === "is_active") {
          const diff = Number(b.is_active) - Number(a.is_active);
          return sortOrder === "asc" ? -diff : diff;
        }
        const valA = String(a[sortKey] ?? "").toLowerCase();
        const valB = String(b[sortKey] ?? "").toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setDepartments(sorted);
      setTotalPages(data.meta?.last_page || data.last_page || 1);
      setTotalDepts(
        statusFilter !== "all"
          ? filtered.length
          : (data.meta?.total || data.total || 0)
      );
    } catch (error: any) {
      console.error("Failed to fetch departments", error);
      setStatus({ 
        type: "destructive", 
        message: error.response?.data?.message || "Gagal mengambil data unit/departemen.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, statusFilter, sortKey, sortOrder, currentPage, campus, user, perPage]);

  // ── Reset ke halaman 1 saat filter/search/sort berubah ──
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, statusFilter, sortKey, sortOrder]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  useEffect(() => { 
    fetchContext(); 
  }, [fetchContext]);

  useEffect(() => { 
    if (user) {
      const delay = setTimeout(fetchDepartments, 400);
      return () => clearTimeout(delay);
    }
  }, [fetchDepartments, user]);

  const onSubmit = async (data: DepartmentFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, data);
        setStatus({ type: "success", message: "Unit berhasil diperbarui." });
      } else {
        await departmentService.createDepartment(data);
        setStatus({ type: "success", message: "Unit berhasil didaftarkan." });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { 
            message: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
          });
        });
      }
      setStatus({ type: "destructive", message: error.response?.data?.message || "Terjadi kesalahan sistem." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setStatus(null);
    try {
      await departmentService.deleteDepartment(deleteConfirmId);
      setDeleteConfirmId(null);
      setStatus({ type: "success", message: "Unit berhasil dihapus." });
      fetchDepartments();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Gagal menghapus unit." });
    }
  };

  const openCreate = () => {
    setEditingDept(null);
    form.reset({ 
      institution_id: campus?.id || 0, 
      name: "", description: "", email: "",
      phone: "", head_name: "", location: "", is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (dept: any) => {
    setEditingDept(dept);
    form.reset({
      institution_id: dept.institution_id || dept.organization_id || 0,
      name: dept.name || "",
      description: dept.description || "",
      email: dept.email || "",
      phone: dept.phone || "",
      head_name: dept.head_name || "",
      location: dept.location || "",
      is_active: !!dept.is_active,
    });
    setIsModalOpen(true);
  };

  const openPreview = (dept: any) => {
    setPreviewDept(dept);
    setIsPreviewOpen(true);
  };

  return {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    statusFilter,       // ← baru
    setStatusFilter,    // ← baru
    sortKey,            // ← baru
    sortOrder,          // ← baru
    handleSort,         // ← baru
    currentPage,
    setCurrentPage,
    totalPages,
    totalDepts,
    campus,
    isModalOpen,
    setIsModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    editingDept,
    previewDept,
    submitting,
    deleteConfirmId,
    setDeleteConfirmId,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
    status,
    setStatus,
    openCreate,
    openEdit,
    openPreview,
  };
};