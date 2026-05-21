import { api } from "@/src/lib/http/axios";
import { OrganizationFormData } from "../schema/orgSchema";

export const orgService = {
  // Institutions
  async getInstitutions(params: any) {
    return api.get("/v1/admin/institutions", { params });
  },
  async createInstitution(data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post("/v1/admin/institutions", formData);
  },
  async updateInstitution(id: number, data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    // Use POST with _method=PUT for Laravel multipart compatibility
    formData.append("_method", "PUT");
    return api.post(`/v1/admin/institutions/${id}`, formData);
  },
  async deleteInstitution(id: number) {
    return api.delete(`/v1/admin/institutions/${id}`);
  },

  // Context
  async getMyInstitutions() {
    return api.get("/v1/my/institutions");
  },
  async getMyOrganizations() {
    return api.get("/v1/my/organizations");
  },
  async updateOrganization(id: number, data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    // Use POST with _method=PUT for Laravel multipart compatibility
    formData.append("_method", "PUT");
    return api.post(`/v1/my/organizations/${id}`, formData);
  }
};
