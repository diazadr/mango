import { useState, useEffect, useCallback } from "react";
import { campusService } from "../services/campusService";
import { departmentService } from "../services/departmentService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advisorSchema, AdvisorFormData } from "../schema/advisorSchema";
import { useAuth } from "@/src/components/providers/AuthProvider";

export const useAdvisors = (perPage: number = 10) => {
  const { user } = useAuth();

  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all"); // ← baru
  const [sortKey, setSortKey] = useState("name");                  // ← baru
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // ← baru
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdvisors, setTotalAdvisors] = useState(0);

  const [campus, setCampus] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [previewUser, setPreviewUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<AdvisorFormData>({
    resolver: zodResolver(advisorSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "advisor",
      department_id: undefined,
    },
  });

  const fetchCampus = useCallback(async () => {
    try {
      const res = await campusService.getMyInstitutions();
      const institutions = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const kampusOrg = institutions.find((org: any) => org.type === "kampus") || institutions[0];
      if (kampusOrg) {
        setCampus(kampusOrg);
        try {
          const deptRes = await departmentService.getDepartments({ institution_id: kampusOrg.id, per_page: 100 });
          setDepartments(deptRes.data.data || []);
        } catch (err) {
          console.error("Failed to fetch departments", err);
        }
      }
    } catch (err) {
      console.error("Failed to fetch campus", err);
    }
  }, []);

  const fetchAdvisors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campusService.getAdvisors({
        search: searchTerm,
        // Kirim search_by hanya jika bukan "all"
        search_by: searchBy !== "all" ? searchBy : undefined,
        // Filter departemen dikirim ke API jika backend support, 
        // fallback ke client-side filtering di bawah
        department_id: departmentFilter !== "all" ? departmentFilter : undefined,
        page: currentPage,
        per_page: perPage,
      });

      const raw: any[] = res.data.data || [];

      // ── Client-side department filter (fallback jika API tidak support) ──
      const filtered = departmentFilter === "all"
        ? raw
        : raw.filter((u) =>
            u.institutions?.some((inst: any) => inst.department_id === departmentFilter)
          );

      // ── Client-side sorting ──
      const sorted = [...filtered].sort((a, b) => {
        const valA = String(a[sortKey] ?? "").toLowerCase();
        const valB = String(b[sortKey] ?? "").toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setAdvisors(sorted);
      // Jika filter dilakukan client-side, total harus disesuaikan
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
      setTotalAdvisors(
        departmentFilter !== "all"
          ? filtered.length
          : (res.data.meta?.total || res.data.total || 0)
      );
    } catch (error) {
      console.error("Failed to fetch advisors", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, departmentFilter, sortKey, sortOrder, currentPage, perPage]);

  // ── Reset ke halaman 1 saat filter/search/sort berubah ──
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, departmentFilter, sortKey, sortOrder]);

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
    fetchCampus();
  }, [fetchCampus]);

  useEffect(() => {
    const delay = setTimeout(fetchAdvisors, 400);
    return () => clearTimeout(delay);
  }, [fetchAdvisors]);

  const onSubmit = async (data: AdvisorFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      const payload = { ...data, institution_id: campus?.id };
      if (editingUser) {
        if (!payload.password) delete payload.password;
        await campusService.updateAdvisor(editingUser.id, payload);
        setStatus({ type: "success", message: "Advisor updated successfully" });
      } else {
        await campusService.createAdvisor(payload);
        setStatus({ type: "success", message: "Advisor created successfully" });
      }
      setIsModalOpen(false);
      fetchAdvisors();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: errors[key][0] });
        });
      }
      setStatus({ type: "destructive", message: error.response?.data?.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setStatus(null);
    try {
      await campusService.deleteAdvisor(deleteConfirmId);
      setDeleteConfirmId(null);
      setStatus({ type: "success", message: "Advisor removed successfully" });
      fetchAdvisors();
    } catch (error: any) {
      setStatus({ type: "destructive", message: "Failed to remove advisor" });
      console.error("Failed to delete advisor", error);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    form.reset({ name: "", email: "", phone: "", password: "", role: "advisor", department_id: undefined });
    setIsModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    const institutionInfo = user.institutions?.find((inst: any) => inst.id === campus?.id);
    const deptId = institutionInfo?.department_id || undefined;
    form.reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: "advisor",
      department_id: deptId,
    });
    setIsModalOpen(true);
  };

  const openPreview = (user: any) => {
    setPreviewUser(user);
    setIsPreviewOpen(true);
  };

  return {
    advisors,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    departmentFilter,       // ← baru
    setDepartmentFilter,    // ← baru
    sortKey,                // ← baru
    sortOrder,              // ← baru
    handleSort,             // ← baru
    currentPage,
    setCurrentPage,
    totalPages,
    totalAdvisors,
    campus,
    departments,
    isModalOpen,
    setIsModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    editingUser,
    previewUser,
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