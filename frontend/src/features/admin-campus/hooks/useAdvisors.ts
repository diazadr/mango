import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { campusService } from "../services/campusService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advisorSchema, AdvisorFormData } from "../schema/advisorSchema";

export const useAdvisors = (perPage: number = 10) => {
  const t = useTranslations("AdminUsersPage");
  const tc = useTranslations("DashboardCommon");
  
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdvisors, setTotalAdvisors] = useState(0);

  const [campus, setCampus] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<AdvisorFormData>({
    resolver: zodResolver(advisorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "advisor",
    },
  });

  const fetchCampus = useCallback(async () => {
    try {
      const res = await campusService.getMyInstitutions();
      const institutions = res.data.data || [];
      const kampusOrg = institutions.find((org: any) => org.type === "kampus");
      if (kampusOrg) setCampus(kampusOrg);
    } catch (err) {}
  }, []);

  const fetchAdvisors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campusService.getAdvisors({
        search: searchTerm,
        search_by: searchBy,
        page: currentPage,
        per_page: perPage,
      });
      setAdvisors(res.data.data || []);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
      setTotalAdvisors(res.data.meta?.total || res.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch advisors", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, currentPage, perPage]);

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
    form.reset({ name: "", email: "", phone: "", password: "", role: "advisor" });
    setIsModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    form.reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: "advisor",
    });
    setIsModalOpen(true);
  };

  return {
    advisors,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalAdvisors,
    isModalOpen,
    setIsModalOpen,
    editingUser,
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
