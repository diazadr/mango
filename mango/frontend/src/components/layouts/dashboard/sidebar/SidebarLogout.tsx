"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/components/providers/AuthProvider";

interface SidebarLogoutProps {
  collapsed: boolean;
}

export const SidebarLogout = ({ collapsed }: SidebarLogoutProps) => {
  const t = useTranslations("DashboardSidebar");
  const { logout } = useAuth();

  return (
    <button 
      onClick={() => logout()} 
      className={`sidebar-item w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 group cursor-pointer ${
        collapsed ? "justify-center" : ""
      }`}
      title={collapsed ? t("logout") : undefined}
    >
      <LogOut size={18} className="sidebar-icon shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200" />
      {!collapsed && (
        <span className="whitespace-nowrap overflow-hidden">{t("logout")}</span>
      )}
    </button>
  );
};
