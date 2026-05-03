"use client";

import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";

import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

interface SidebarHeaderProps {
  collapsed: boolean;
  user: any;
}

export const SidebarHeader = ({ collapsed, user }: SidebarHeaderProps) => {
  const t = useTranslations("DashboardSidebar");

  // Determine if this is a UMKM user
  const isUmkm = user?.roles?.includes("umkm");
  const umkm = user?.umkm;
  
  // Name for fallback letter
  const nameToUse = (isUmkm && umkm?.name) ? umkm.name : (user?.name || "M");
  const firstLetter = nameToUse.charAt(0).toUpperCase();
  
  const logoUrl = isUmkm ? umkm?.logo_url : null;

  return (
    <div className="sidebar-header">
      <Link href="/dashboard" className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}>
        {/* Symmetrical Rounded Logo Box - Synced with Identity Style */}
        <Avatar className="w-9 h-9 rounded-lg overflow-hidden border border-primary/20 shadow-sm shrink-0 flex-shrink-0 bg-white relative">
          <AvatarImage 
            src={logoUrl || ""} 
            alt={nameToUse} 
            className="w-full h-full object-cover z-20"
          />
          <AvatarFallback className="absolute inset-0 bg-primary text-primary-foreground flex items-center justify-center font-black text-sm uppercase rounded-none z-10">
            {firstLetter}
          </AvatarFallback>
        </Avatar>

        {!collapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="font-bold tracking-tight text-sidebar-foreground text-xs whitespace-nowrap">
              {t("brand")}
            </span>
            <span className="text-[10px] text-muted-foreground truncate font-medium">
              {nameToUse}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};
