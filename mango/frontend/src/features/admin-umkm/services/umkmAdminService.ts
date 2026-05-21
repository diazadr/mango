import { api } from "@/src/lib/http/axios";

export const umkmAdminService = {
  async getUmkmList(params?: any) {
    return api.get("/v1/admin/umkm", { params });
  },

  async getMyOrganizations() {
    return api.get("/v1/my/organizations");
  },

  async approveUmkm(umkmId: number) {
    return api.post(`/v1/admin/umkm/${umkmId}/approve`);
  },

  async rejectUmkm(umkmId: number, reason: string) {
    return api.post(`/v1/admin/umkm/${umkmId}/reject`, { reason });
  },
};
