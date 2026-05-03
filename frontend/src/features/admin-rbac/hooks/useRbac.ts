import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { rbacService } from "../services/rbacService";
import { User } from "@/src/types/auth";

export type Role = {
  id: number;
  name: string;
};

export const useRbac = (perPage: number = 10) => {
  const t = useTranslations("RbacMembersPage");
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, roleRes] = await Promise.all([
        rbacService.getUsers({
          search: searchTerm,
          search_by: searchBy,
          page: currentPage,
          per_page: perPage,
        }),
        rbacService.getRoles(),
      ]);

      const userData = userRes.data;
      setUsers(userData.data || []);
      setTotalPages(userData.meta?.last_page || userData.last_page || 1);
      setTotalUsers(userData.meta?.total || userData.total || 0);
      setAvailableRoles(roleRes.data.data || []);
    } catch (error) {
      console.error("Error fetching RBAC data", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchBy, searchTerm, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchBy, searchTerm]);

  useEffect(() => {
    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [fetchData]);

  const handleSyncRoles = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await rbacService.syncUserRoles(selectedUser.id, selectedRoles);
      setIsModalOpen(false);
      setStatus({ type: "success", message: "User roles synchronized successfully" });
      fetchData();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to sync roles" });
    } finally {
      setSubmitting(false);
    }
  };

  const openModifyModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setIsModalOpen(true);
  };

  const toggleRoleSelection = (roleName: string) => {
    setSelectedRoles((current) =>
      current.includes(roleName) ? current.filter((r) => r !== roleName) : [...current, roleName]
    );
  };

  return {
    users,
    availableRoles,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    isModalOpen,
    setIsModalOpen,
    selectedUser,
    selectedRoles,
    submitting,
    handleSyncRoles,
    openModifyModal,
    toggleRoleSelection,
    fetchData,
    status,
    setStatus,
    t,
  };
};
