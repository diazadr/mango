import axios from "axios";

export const web = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "69420",
        "Bypass-Tunnel-Reminder": "true",
    },
});

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api`,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "69420",
        "Bypass-Tunnel-Reminder": "true",
    },
});

// Add global interceptor to handle 401 Unauthorized (Session Expired)
const handleUnauthorized = (error: any) => {
    if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            
            // Sesuai dengan middleware.ts: dashboard, profile, onboarding, verify-email, settings, workspace, admin
            const isProtectedPage = /\/(dashboard|profile|onboarding|verify-email|settings|workspace|admin)(\/|$)/.test(pathname);
            
            // Only redirect if we are not already on the login page AND it's a protected page
            if (!pathname.includes('/login') && isProtectedPage) {
                window.location.href = '/login?expired=1';
            }
        }
    }
    return Promise.reject(error);
};

web.interceptors.response.use((response) => response, handleUnauthorized);
api.interceptors.response.use((response) => response, handleUnauthorized);

export default api;
