import { api } from "@/src/lib/http/axios";
import { AdvisorFormData } from "../schema/advisorSchema";

export const campusService = {
  async getAdvisors(params: { search?: string; search_by?: string; page?: number; per_page?: number }) {
    return api.get("/v1/admin/users", { 
      params: { ...params, role: "advisor" } 
    });
  },

  async createAdvisor(data: AdvisorFormData) {
    return api.post("/v1/admin/users", data);
  },

  async updateAdvisor(userId: number, data: AdvisorFormData) {
    return api.put(`/v1/admin/users/${userId}`, data);
  },

  async deleteAdvisor(userId: number) {
    return api.delete(`/v1/admin/users/${userId}`);
  },

  async getMyInstitutions() {
    return api.get("/v1/my/institutions");
  },

  async updateInstitution(orgId: number, data: any) {
    return api.put(`/v1/my/institutions/${orgId}`, data);
  }
};
