import { api } from "@/src/lib/http/axios";

export const mentoringService = {
  async getRequests() {
    return api.get("/v1/mentoring/requests");
  },

  async getDepartments() {
    return api.get("/v1/mentoring/departments");
  },

  async getAdvisors() {
    return api.get("/v1/admin/users?role=advisor");
  },

  async assignDepartment(requestId: number, departmentId: string) {
    return api.post(`/v1/mentoring/requests/${requestId}/assign-department`, {
      department_id: departmentId,
    });
  },

  async assignAdvisor(requestId: number, advisorUserId: string) {
    return api.post(`/v1/mentoring/requests/${requestId}/assign`, {
      mentor_user_id: advisorUserId,
    });
  },
};
