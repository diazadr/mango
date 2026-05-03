import { api } from "@/src/lib/http/axios";
import { UserAdminFormData } from "../schema/userSchema";

export const userAdminService = {
  async getUsers(params: { 
    search?: string; 
    search_by?: string; 
    role?: string; 
    is_active?: string;
    page?: number; 
    per_page?: number;
    sort_by?: string;
    sort_dir?: string;
  }) {
    return api.get("/v1/admin/users", { params });
  },

  async createUser(data: UserAdminFormData) {
    return api.post("/v1/admin/users", data);
  },

  async updateUser(userId: number, data: UserAdminFormData) {
    return api.put(`/v1/admin/users/${userId}`, data);
  },

  async deleteUser(userId: number) {
    return api.delete(`/v1/admin/users/${userId}`);
  },
};
