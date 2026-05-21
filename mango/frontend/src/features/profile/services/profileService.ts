import { api, web } from "@/src/lib/http/axios";
import { ProfileFormData, PasswordFormData } from "../schema/profileSchema";

export const profileService = {
  async updateProfile(data: ProfileFormData) {
    // For avatar upload, we need to use FormData
    const formData = new FormData();
    formData.append("_method", "PUT");
    
    Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return api.post("/v1/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
  },

  async updatePassword(data: PasswordFormData) {
    return api.put("/v1/profile/password", data);
  },

  async resendVerification() {
    return api.post("/v1/profile/resend-verification");
  },

  async getActivityLog() {
    return api.get("/v1/profile/activity-log");
  },

  async getSessions() {
    return api.get("/v1/profile/sessions");
  },

  async logoutSession(id: string) {
    return api.delete(`/v1/profile/sessions/${id}`);
  },

  async logoutOtherSessions(password: string) {
    return api.post("/v1/profile/logout-other-sessions", { password });
  },

  async deleteAccount(password: string) {
    return api.post("/v1/profile/delete-account", { password });
  },

  async getNotificationSettings() {
    return api.get("/v1/profile/notifications");
  },

  async updateNotificationSettings(data: any) {
    return api.put("/v1/profile/notifications", data);
  },

  // Fortify 2FA Methods (using 'web' instance to avoid /api prefix)
  async enableTwoFactor() {
    return web.post("/user/two-factor-authentication");
  },

  async disableTwoFactor() {
    return web.delete("/user/two-factor-authentication");
  },

  async getTwoFactorQrCode() {
    return web.get("/user/two-factor-qr-code");
  },

  async getTwoFactorRecoveryCodes() {
    return web.get("/user/two-factor-recovery-codes");
  },

  async regenerateTwoFactorRecoveryCodes() {
    return web.post("/user/two-factor-recovery-codes");
  },

  async confirmTwoFactor(code: string) {
    return web.post("/user/confirmed-two-factor-authentication", { code });
  },

  // Password Confirmation
  async confirmPassword(password: string) {
    return web.post("/user/confirm-password", { password });
  },

  async getPasswordConfirmationStatus() {
    return web.get("/user/confirmed-password-status");
  }
};
