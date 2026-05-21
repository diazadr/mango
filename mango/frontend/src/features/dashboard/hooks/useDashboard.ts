import { useAuth } from "@/src/components/providers/AuthProvider";
import { useMemo } from "react";

export const useDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  const role = useMemo(() => {
    if (!user) return "";
    
    const rolePriority = ["super_admin", "admin", "advisor", "upt", "umkm"];
    return rolePriority.find((p) => user.roles?.includes(p)) || "";
  }, [user]);

  return {
    user,
    role,
    isLoading,
    isAuthenticated
  };
};
