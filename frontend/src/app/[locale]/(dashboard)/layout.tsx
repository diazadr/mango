"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "@/src/components/layouts/dashboard/sidebar";
import DashboardNavbar from "@/src/components/layouts/dashboard/navbar";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  // Handle success messages from URL
  useEffect(() => {
    if (searchParams.get("login") === "success") {
      setShowLoginSuccess(true);
      // Automatically hide after 5 seconds
      const timer = setTimeout(() => {
        setShowLoginSuccess(false);
        // Clean up URL without refreshing
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Determine user role and handle access control
  const userRole = useMemo(() => {
    if (!user) return "";
    
    // Prioritize explicit is_super_admin flag from API
    if (user.is_super_admin) return "super_admin";
    
    const rolePriority = ["super_admin", "admin", "advisor", "upt", "umkm"];
    return rolePriority.find((r) => user.roles?.includes(r)) || "";
  }, [user]);

  // Handle Redirects and RBAC
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const pathWithoutLocale = pathname.replace(/^\/(id|en)/, "") || "/";
    
    // Auth & Onboarding Gates
    // Jika di /onboarding, jangan redirect lagi ke /onboarding
    if (pathWithoutLocale !== "/verify-email") {
      if (!user?.email_verified_at) {
        router.push("/verify-email");
        return;
      }

      if (pathWithoutLocale !== "/onboarding" && user?.roles?.includes("umkm") && !user?.umkm) {
        router.push("/onboarding");
        return;
      }
    }

    // RBAC Gates
    const accessRules = [
      { prefix: "/admin/rbac", roles: ["super_admin"] },
      { prefix: "/admin/upt", roles: ["upt", "super_admin"] },
      { prefix: "/admin/campus", roles: ["admin", "super_admin"] },
      { prefix: "/admin", roles: ["super_admin", "admin"] },
      { prefix: "/workspace/reservations", roles: ["umkm", "upt", "super_admin"] },
      { prefix: "/workspace/machines", roles: ["umkm", "upt", "super_admin"] },
      { prefix: "/workspace/umkm/mentoring", roles: ["umkm", "admin", "super_admin"] },
      { prefix: "/workspace/umkm", roles: ["umkm", "advisor", "super_admin"] },
      { prefix: "/dashboard", roles: ["super_admin", "admin", "advisor", "upt", "umkm"] },
      { prefix: "/profile", roles: ["super_admin", "admin", "advisor", "upt", "umkm"] },
    ];

    const rule = accessRules.find((item) => pathWithoutLocale.startsWith(item.prefix));
    if (rule && !rule.roles.includes(userRole)) {
      router.replace("/forbidden");
    }
  }, [isLoading, isAuthenticated, user, pathname, router, userRole]);

  // Sidebar persistence
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "true");
  }, []);

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="relative flex items-center justify-center mb-6 animate-pulse">
          <img src="/images/logos/logo-mango.png" alt="MANGO Logo" className="h-16 w-auto object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      <DashboardSidebar 
        role={userRole} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar 
          user={user} 
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 relative overflow-y-auto">
          <div className="p-6 lg:p-8">
            <AnimatePresence>
              {showLoginSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <Alert variant="success" className="shadow-lg border-success/30 bg-success/10">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="font-bold">Login Berhasil!</span> Selamat datang kembali di dashboard MANGO.
                      <button onClick={() => setShowLoginSuccess(false)} className="ml-4">
                        <X size={16} className="opacity-50 hover:opacity-100" />
                      </button>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
