import { api } from "@/src/lib/http/axios";

export const sikimService = {
  async getMyInstitutions() {
    return api.get("/v1/my/institutions");
  },

  async getPendingMembers(orgId: number) {
    return api.get(`/v1/admin/institutions/${orgId}/members?is_active=0`);
  },

  async approveMember(orgId: number, userId: number) {
    return api.put(`/v1/admin/institutions/${orgId}/members/${userId}/status`, {
      is_active: true
    });
  },

  async rejectMember(orgId: number, userId: number) {
    return api.delete(`/v1/admin/institutions/${orgId}/members/${userId}`);
  },
};
