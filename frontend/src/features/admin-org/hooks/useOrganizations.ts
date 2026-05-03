import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orgService } from "../services/orgService";
import { organizationSchema, OrganizationFormData } from "../schema/orgSchema";

export const useOrganizations = (perPage: number = 10) => {
  const t = useTranslations("OrganizationsPage");
  const tc = useTranslations("DashboardCommon");
  
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstitutions, setTotalInstitutions] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      type: "kampus",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      is_active: true,
    },
  });

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (searchTerm && searchBy !== "all") params.search_by = searchBy;
      if (typeFilter !== "all") params.type = typeFilter;

      const res = await orgService.getInstitutions(params);
      const { data, meta } = res.data;
      setInstitutions(data || []);
      setTotalPages(meta?.last_page || 1);
      setTotalInstitutions(meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch institutions", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, typeFilter, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, typeFilter]);

  useEffect(() => {
    const delay = setTimeout(fetchInstitutions, 400);
    return () => clearTimeout(delay);
  }, [fetchInstitutions]);

  const onSubmit = async (data: OrganizationFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingOrg) {
        await orgService.updateInstitution(editingOrg.id, data);
        setStatus({ type: "success", message: "Institution updated successfully" });
      } else {
        await orgService.createInstitution(data);
        setStatus({ type: "success", message: "Institution created successfully" });
      }
      setIsModalOpen(false);
      fetchInstitutions();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: Array.isArray(errors[key]) ? errors[key][0] : errors[key] });
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
      await orgService.deleteInstitution(deleteConfirmId);
      setDeleteConfirmId(null);
      setStatus({ type: "success", message: "Institution deleted successfully" });
      fetchInstitutions();
    } catch (error: any) {
      setStatus({ type: "destructive", message: "Failed to delete institution" });
      console.error("Failed to delete institution", error);
    }
  };

  const openCreate = () => {
    setEditingOrg(null);
    form.reset({
      name: "",
      type: "kampus",
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
      name: org.name || "",
      type: org.type || "kampus",
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
    organizations: institutions,
    institutions,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalOrgs: totalInstitutions,
    totalInstitutions,
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
