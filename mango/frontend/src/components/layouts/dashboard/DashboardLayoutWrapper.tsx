"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import DashboardSidebar from "@/src/components/layouts/dashboard/sidebar";
import DashboardNavbar from "@/src/components/layouts/dashboard/navbar";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("DashboardLayoutWrapper");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle success messages from URL
  useEffect(() => {
    if (searchParams.get("login") === "success") {
      setShowLoginSuccess(true);
      // Timeout is handled by StatusAlert component
    }
  }, [searchParams]);

  // Determine user role and handle access control
  const userRole = useMemo(() => {
    if (!user) return "";
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
      { prefix: "/admin/campus", roles: ["admin", "super_admin", "upt"] },
      { prefix: "/admin/organizations", roles: ["super_admin"] },
      { prefix: "/admin/upt/umkm", roles: ["super_admin", "upt"] },
      { prefix: "/admin/upt/profile", roles: ["super_admin", "upt"] },
      { prefix: "/admin/upt/approvals", roles: ["super_admin", "upt"] },
      { prefix: "/admin", roles: ["super_admin", "admin"] },
      { prefix: "/workspace/reservations", roles: ["umkm", "admin", "super_admin", "upt"] },
      { prefix: "/workspace/machines", roles: ["umkm", "admin", "super_admin", "upt"] },
      { prefix: "/workspace/manufacturing", roles: ["umkm", "admin", "super_admin", "upt"] },
      { prefix: "/workspace/umkm/mentoring", roles: ["umkm", "admin", "super_admin"] },
      { prefix: "/workspace/umkm", roles: ["umkm", "advisor", "super_admin"] },
      { prefix: "/dashboard", roles: ["super_admin", "admin", "advisor", "umkm", "upt"] },
      { prefix: "/profile", roles: ["super_admin", "admin", "advisor", "umkm", "upt"] },
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
          <img src="/images/logos/logo-mango.png" alt={t("alt_mango_logo")} className="h-16 w-auto object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="sidebar-overlay"
          />
        )}
      </AnimatePresence>

      <DashboardSidebar
        role={userRole}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        className={mobileMenuOpen ? "sidebar-mobile-open" : ""}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileMenuOpen(!mobileMenuOpen);
            } else {
              handleToggleSidebar();
            }
          }}
        />
        <main className="flex-1 relative overflow-y-auto">
          <div className="p-6 lg:p-8">
            <AnimatePresence>
              {showLoginSuccess && (
                <div className="mb-6">
                  <StatusAlert 
                    status={{ type: "success", message: t("msg_login_berhasil_selamat_datang_kembali_di") }} 
                    onDismiss={() => {
                      setShowLoginSuccess(false);
                      window.history.replaceState({}, '', window.location.pathname);
                    }} 
                    autoDismissMs={3000} 
                  />
                </div>
              )}
            </AnimatePresence>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
