import { api } from "@/src/lib/http/axios";

export const rbacService = {
  async getUsers(params: { search?: string; search_by?: string; page?: number; per_page?: number }) {
    return api.get("/v1/admin/user-roles", { params });
  },

  async getRoles() {
    return api.get("/v1/admin/roles", { params: { per_page: 100 } });
  },

  async syncUserRoles(userId: number, roles: string[]) {
    return api.post(`/v1/admin/users/${userId}/roles`, { roles });
  },
};
