import { api } from "@/src/lib/http/axios";

export const organizationApprovalsService = {
  async getMyOrganizations() {
    return api.get("/v1/my/organizations");
  },

  async getPendingUmkms() {
    return api.get(`/v1/admin/umkm?status=pending`);
  },

  async approveUmkm(umkmId: string) {
    return api.post(`/v1/admin/umkm/${umkmId}/approve`);
  },

  async rejectUmkm(umkmId: string, reason: string = "Tidak memenuhi kriteria") {
    return api.post(`/v1/admin/umkm/${umkmId}/reject`, { reason });
  },
};
