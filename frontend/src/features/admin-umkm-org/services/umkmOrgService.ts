import { api } from "@/src/lib/http/axios";
import { UmkmOrganizationFormData } from "../schema/umkmOrgSchema";

export const umkmOrgService = {
  async getOrganizations(params: any) {
    return api.get("/v1/admin/organizations", { params });
  },
  async createOrganization(data: UmkmOrganizationFormData) {
    return api.post("/v1/admin/organizations", data);
  },
  async updateOrganization(id: number, data: UmkmOrganizationFormData) {
    return api.put(`/v1/admin/organizations/${id}`, data);
  },
  async deleteOrganization(id: number) {
    return api.delete(`/v1/admin/organizations/${id}`);
  },
  async getUptList() {
    return api.get("/v1/admin/institutions", { params: { type: 'upt', per_page: 100 } });
  }
};
