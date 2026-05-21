import { api, web } from "@/src/lib/http/axios";
import { CompanyFormData, BusinessProfileFormData } from "../schema/onboardingSchema";

export const onboardingService = {
  async submitCompany(data: CompanyFormData) {
    // For logo upload, use FormData
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return api.post("/v1/umkm", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
  },

  async updateUmkm(umkmId: string | number, data: any) {
    await web.get("/sanctum/csrf-cookie");
    const formData = data instanceof FormData ? data : new FormData();
    
    if (!(data instanceof FormData)) {
        formData.append("_method", "PUT");
        Object.keys(data).forEach((key) => {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
    } else if (!formData.has("_method")) {
        formData.append("_method", "PUT");
    }

    return api.post(`/v1/umkm/${umkmId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
  },

  async submitBusinessProfile(data: BusinessProfileFormData) {
    const status = await this.getUserOnboardingStatus();
    const umkmId = status.data.data?.user?.umkm?.id;
    
    if (!umkmId) {
        throw new Error("UMKM not found. Please complete the first step.");
    }

    return api.post(`/v1/umkm/${umkmId}/profile`, data);
  },

  async getUserOnboardingStatus() {
    return api.get("/v1/me");
  },

  async getOrganizations() {
    return api.get("/v1/organizations?simple=1");
  },

  async addCertification(umkmId: string, data: FormData) {
    await web.get("/sanctum/csrf-cookie");
    return api.post(`/v1/umkm/${umkmId}/certifications`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });
  },

  async deleteCertification(umkmId: string, certId: number) {
    await web.get("/sanctum/csrf-cookie");
    return api.delete(`/v1/umkm/${umkmId}/certifications/${certId}`);
  },

  async downloadResume(umkmId: string) {
    return api.get(`/v1/umkm/${umkmId}/export-resume`, {
        responseType: 'blob'
    });
  }
};
