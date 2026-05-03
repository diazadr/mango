import { api } from "@/src/lib/http/axios";

export const umkmAdminService = {
  async getUmkmList() {
    return api.get("/v1/admin/umkm");
  },

  async getMyInstitutions() {
    return api.get("/v1/my/institutions");
  },
};
