import { web } from "@/src/lib/http/axios";
import { LoginFormData } from "../schema/loginSchema";
import { RegisterFormData } from "../schema/registerSchema";
import { ForgotPasswordFormData, ResetPasswordFormData } from "../schema/passwordSchema";

export const authService = {
  async login(data: LoginFormData) {
    await web.get("/sanctum/csrf-cookie");
    return web.post("/login", data, {
      headers: {
        Accept: "application/json",
      },
    });
  },

  async register(data: RegisterFormData) {
    await web.get("/sanctum/csrf-cookie");
    
    // Use FormData for registration to support avatar upload
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return web.post("/register", formData, {
      headers: {
        "Accept": "application/json",
        // Do not manually set Content-Type for FormData, browser will set it with boundary
      },
    });
  },

  async forgotPassword(data: ForgotPasswordFormData) {
    await web.get("/sanctum/csrf-cookie");
    return web.post("/forgot-password", data, {
        headers: {
            "Accept": "application/json",
        }
    });
  },

  async resetPassword(data: ResetPasswordFormData) {
    await web.get("/sanctum/csrf-cookie");
    return web.post("/reset-password", data, {
        headers: {
            "Accept": "application/json",
        }
    });
  },

  async resendVerification() {
    return web.post("/email/verification-notification");
  },
};
