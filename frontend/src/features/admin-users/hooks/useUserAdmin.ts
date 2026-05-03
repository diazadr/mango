import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { userAdminService } from "../services/userAdminService";
import { userAdminSchema, UserAdminFormData } from "../schema/userSchema";

export const useUserAdmin = (perPage: number = 10) => {
  const t = useTranslations("AdminUsersPage");
  const tc = useTranslations("DashboardCommon");
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [sortKey, setSortKey] = useState<string | null>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<UserAdminFormData>({
    resolver: zodResolver(userAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "umkm",
    },
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAdminService.getUsers({
        page: currentPage,
        per_page: perPage,
        search: searchTerm || undefined,
        search_by: searchTerm && searchBy !== "all" ? searchBy : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        is_active: statusFilter !== "all" ? statusFilter : undefined,
        sort_by: sortKey || undefined,
        sort_dir: sortOrder || undefined,
      });
      const { data, meta } = res.data;
      setUsers(data || []);
      setTotalPages(meta?.last_page || 1);
      setTotalUsers(meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, roleFilter, statusFilter, currentPage, perPage, sortKey, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, roleFilter, statusFilter, sortKey, sortOrder]);

  useEffect(() => {
    const delay = setTimeout(fetchUsers, 400);
    return () => clearTimeout(delay);
  }, [fetchUsers]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const onSubmit = async (data: UserAdminFormData) => {
    setSubmitting(true);
    setStatus(null);
    try {
      const payload: any = { ...data };
      
      // Auto-assign organization if current user is not super_admin
      const myInstitution = (currentUser?.institutions || currentUser?.organizations || []).find((organization: any) =>
        ["kampus", "upt"].includes(organization.type)
      );

      if (!currentUser?.is_super_admin && myInstitution) {
        payload.institution_id = myInstitution.id;
      }

      if (editingUser) {
        if (!payload.password) delete payload.password;
        await userAdminService.updateUser(editingUser.id, payload);
        setStatus({ type: "success", message: "User updated successfully" });
      } else {
        await userAdminService.createUser(payload);
        setStatus({ type: "success", message: "User created successfully" });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, { message: Array.isArray(errors[key]) ? errors[key][0] : errors[key] });
        });
      }
      setStatus({ type: "destructive", message: error.response?.data?.message || "An error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setStatus(null);
    try {
      await userAdminService.deleteUser(deleteConfirmId);
      setDeleteConfirmId(null);
      setStatus({ type: "success", message: "User deleted successfully" });
      fetchUsers();
    } catch (error: any) {
      setStatus({ type: "destructive", message: "Failed to delete user" });
      console.error("Failed to delete user", error);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    form.reset({ name: "", email: "", phone: "", password: "", role: "umkm" });
    setIsModalOpen(true);
  };

  const openEdit = (user: any) => {
    const role = user.roles?.[0];
    const roleName = typeof role === "string" ? role : role?.name || "umkm";
    
    setEditingUser(user);
    form.reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: roleName,
    });
    setIsModalOpen(true);
  };

  return {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    sortKey,
    sortOrder,
    handleSort,
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
