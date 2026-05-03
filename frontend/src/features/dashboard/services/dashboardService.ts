import { api } from "@/src/lib/http/axios";

export const dashboardService = {
  async getSummary() {
    return api.get("/v1/admin/dashboard/summary");
  },
  async getUmkmStats() {
    return api.get("/v1/admin/umkm/stats");
  }
};
