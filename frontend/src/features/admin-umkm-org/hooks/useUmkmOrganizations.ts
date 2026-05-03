import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { umkmOrgService } from "../services/umkmOrgService";
import { umkmOrganizationSchema, UmkmOrganizationFormData } from "../schema/umkmOrgSchema";

export const useUmkmOrganizations = (perPage: number = 10) => {
  const t = useTranslations("OrganizationsPage");
  const tc = useTranslations("DashboardCommon");
  
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [uptList, setUptList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uptFilter, setUptFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<UmkmOrganizationFormData>({
    resolver: zodResolver(umkmOrganizationSchema),
    defaultValues: {
      upt_id: 0,
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      is_active: true,
    },
  });

  const fetchUpts = useCallback(async () => {
    try {
      const res = await umkmOrgService.getUptList();
      setUptList(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch UPTs", error);
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (uptFilter !== "all") params.upt_id = uptFilter;

      const res = await umkmOrgService.getOrganizations(params);
      
      // FIX: Menyesuaikan dengan format { data: [], meta: { total: 0 } }
      const data = res.data.data || [];
      const meta = res.data.meta || {};
      
      setOrganizations(data);
      setTotalPages(meta.last_page || 1);
      setTotalRecords(meta.total || 0);
    } catch (error) {
      console.error("Failed to fetch organizations", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, uptFilter, currentPage, perPage]);

  useEffect(() => {
    fetchUpts();
  }, [fetchUpts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, uptFilter]);

  useEffect(() => {
    const delay = setTimeout(fetchOrganizations, 400);
    return () => clearTimeout(delay);
  }, [fetchOrganizations]);

  const onSubmit = async (data: UmkmOrganizationFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingOrg) {
        await umkmOrgService.updateOrganization(editingOrg.id, data);
        setStatus({ type: "success", message: "Organisasi UMKM berhasil diperbarui" });
      } else {
        await umkmOrgService.createOrganization(data);
        setStatus({ type: "success", message: "Organisasi UMKM berhasil dibuat" });
      }
      setIsModalOpen(false);
      fetchOrganizations();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: Array.isArray(errors[key]) ? errors[key][0] : errors[key] });
        });
      }
      setStatus({ type: "destructive", message: error.response?.data?.message || "Operasi gagal" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setStatus(null);
    try {
      await umkmOrgService.deleteOrganization(deleteConfirmId);
      setDeleteConfirmId(null);
      setStatus({ type: "success", message: "Organisasi UMKM berhasil dihapus" });
      fetchOrganizations();
    } catch (error: any) {
      setStatus({ type: "destructive", message: "Gagal menghapus organisasi UMKM" });
    }
  };

  const openCreate = () => {
    setEditingOrg(null);
    form.reset({
      upt_id: uptList.length > 0 ? uptList[0].id : 0,
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (org: any) => {
    setEditingOrg(org);
    form.reset({
      upt_id: org.upt_id || 0,
      name: org.name || "",
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
      city: org.city || "",
      province: org.province || "",
      postal_code: org.postal_code || "",
      is_active: !!org.is_active,
    });
    setIsModalOpen(true);
  };

  return {
    organizations,
    uptList,
    loading,
    searchTerm,
    setSearchTerm,
    uptFilter,
    setUptFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalRecords,
    isModalOpen,
    setIsModalOpen,
    editingOrg,
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
