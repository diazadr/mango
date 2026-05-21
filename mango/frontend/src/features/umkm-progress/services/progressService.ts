import { api } from "@/src/lib/http/axios";

export const progressService = {
  async getProgressHistory(umkmUuid: string) {
    return api.get(`/v1/umkm/${umkmUuid}/progress-history`);
  },
  
  async getMyProgressHistory() {
    // In backend, if umkm uuid is not provided, it might fail or handle current user's umkm
    // But since we have a resource route, let's get the umkm data first or use a shortcut if available.
    // For now, assume we need the UUID.
    return api.get("/v1/umkm").then(res => {
      const myUmkm = res.data.data?.[0];
      if (!myUmkm) throw new Error("UMKM profile not found");
      return api.get(`/v1/umkm/${myUmkm.uuid}/progress-history`);
    });
  }
};
