"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, web } from "@/src/lib/http/axios";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  avatar_large?: string;
  is_active: boolean;
  email_verified_at: string | null;
  roles: string[];
  umkm?: any;
  settings?: any;
  is_super_admin?: boolean; // Added for convenience
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/v1/me");
      const data = response.data.data;
      
      if (data && data.user) {
          const userData: User = {
              ...data.user,
              is_super_admin: data.is_super_admin
          };
          setUser(userData);
          return userData;
      }
      
      setUser(null);
      return null;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async () => {
    return await fetchUser();
  };

  const logout = async () => {
    try {
      // 1. Fetch CSRF token first
      await web.get("/sanctum/csrf-cookie");
      // 2. Call backend logout
      await web.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 3. Clear all potential client-side indicators
      setUser(null);
      
      // 4. Aggressively clear cookies that aren't HttpOnly
      Cookies.remove("XSRF-TOKEN", { path: "/" });
      Cookies.remove("mango_session", { path: "/" });
      Cookies.remove("mango-session", { path: "/" });
      
      // 5. Hard refresh to Login to ensure Middleware re-evaluates
      const locale = window.location.pathname.split('/')[1] || 'en';
      window.location.replace(`/${locale}/login?logout=success`);
    }
  };

  const refreshUser = async () => {
    return await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
