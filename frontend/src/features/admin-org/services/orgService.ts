import { api } from "@/src/lib/http/axios";
import { OrganizationFormData, DepartmentFormData } from "../schema/orgSchema";

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
    return api.post("/v1/admin/institutions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async updateInstitution(id: number, data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    // Use POST with _method=PUT for Laravel multipart compatibility
    return api.post(`/v1/admin/institutions/${id}`, formData, {
      params: { _method: "PUT" },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async deleteInstitution(id: number) {
    return api.delete(`/v1/admin/institutions/${id}`);
  },

  // Departments
  async getDepartments(params: any) {
    return api.get("/v1/admin/departments", { params });
  },
  async createDepartment(data: DepartmentFormData) {
    return api.post("/v1/admin/departments", data);
  },
  async updateDepartment(id: number, data: DepartmentFormData) {
    return api.put(`/v1/admin/departments/${id}`, data);
  },
  async deleteDepartment(id: number) {
    return api.delete(`/v1/admin/departments/${id}`);
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
    return api.post(`/v1/my/organizations/${id}`, formData, {
      params: { _method: "PUT" },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};
