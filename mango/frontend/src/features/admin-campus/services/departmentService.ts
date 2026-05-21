import { api } from "@/src/lib/http/axios";
import { DepartmentFormData } from "../schema/departmentSchema";

export const departmentService = {
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
  }
};
