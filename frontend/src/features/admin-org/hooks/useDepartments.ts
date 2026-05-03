import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orgService } from "../services/orgService";
import { departmentSchema, DepartmentFormData } from "../schema/orgSchema";
import { useAuth } from "@/src/components/providers/AuthProvider";

export const useDepartments = (perPage: number = 10) => {
  const t = useTranslations("DepartmentsPage");
  const tc = useTranslations("DashboardCommon");
  const { user } = useAuth();
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepts, setTotalDepts] = useState(0);

  const [campus, setCampus] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      institution_id: 0,
      name: "",
      description: "",
      is_active: true,
    },
  });

  const fetchContext = useCallback(async () => {
    try {
      const orgRes = await orgService.getMyInstitutions();
      const organizations = orgRes.data.data || [];
      // Find campus for Admin, or just take first for Super Admin to narrow down
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
    setStatus(null);
    try {
      const params: any = { 
        page: currentPage, 
        per_page: perPage 
      };
      
      if (searchTerm) params.search = searchTerm;
      if (searchTerm && searchBy !== "all") params.search_by = searchBy;
      
      // If Admin (not Super Admin), restrict to their organization
      if (campus && user && !user.is_super_admin) {
        params.institution_id = campus.id;
      }

      const res = await orgService.getDepartments(params);
      const { data, meta } = res.data;
      
      setDepartments(data || []);
      setTotalPages(meta?.last_page || 1);
      setTotalDepts(meta?.total || 0);
    } catch (error: any) {
      console.error("Failed to fetch departments", error);
      setStatus({ 
        type: "destructive", 
        message: error.response?.data?.message || "Gagal mengambil data unit/departemen. Pastikan Anda memiliki akses." 
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, currentPage, campus, user, perPage]);

  useEffect(() => { 
    fetchContext(); 
  }, [fetchContext]);

  useEffect(() => { 
    if (user) {
        const delay = setTimeout(fetchDepartments, 400);
        return () => clearTimeout(delay);
    }
  }, [fetchDepartments, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy]);

  const onSubmit = async (data: DepartmentFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingDept) {
        await orgService.updateDepartment(editingDept.id, data);
        setStatus({ type: "success", message: "Unit berhasil diperbarui." });
      } else {
        await orgService.createDepartment(data);
        setStatus({ type: "success", message: "Unit berhasil didaftarkan." });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: Array.isArray(errors[key]) ? errors[key][0] : errors[key] });
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
      await orgService.deleteDepartment(deleteConfirmId);
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
      name: "", 
      description: "", 
      is_active: true 
    });
    setIsModalOpen(true);
  };

  const openEdit = (dept: any) => {
    setEditingDept(dept);
    form.reset({
      institution_id: dept.institution_id || dept.organization_id || 0,
      name: dept.name || "",
      description: dept.description || "",
      is_active: !!dept.is_active
    });
    setIsModalOpen(true);
  };

  return {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalDepts,
    campus,
    isModalOpen,
    setIsModalOpen,
    editingDept,
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
    t,
    tc,
  };
};
