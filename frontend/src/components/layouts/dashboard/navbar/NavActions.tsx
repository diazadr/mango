"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/src/i18n/navigation";
import { Bell, ChevronDown, User, Settings, LogOut, Store } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { api, web } from "@/src/lib/http/axios";
import Cookies from "js-cookie";

import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

export const NavActions = ({ user }: { user: any }) => {
  const t = useTranslations("DashboardNavbar");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUmkm = user?.roles?.includes("umkm");
  const umkm = user?.umkm;
  
  const rawRole = user?.roles?.[0] || "";
  const displayRole = rawRole.replace('_', ' ');
  const displayName = user?.name || "";
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : "";

  const isDuplicate = displayName && displayRole && displayName.toLowerCase() === displayRole.toLowerCase();

  const handleLogout = async () => {
    try {
      // 1. Fetch CSRF cookie first to avoid 419
      await web.get("/sanctum/csrf-cookie");
      
      // 2. Perform logout
      await web.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 3. Always clear local state
      Cookies.remove("token", { path: "/" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // 4. Redirect to localized login page
      const locale = window.location.pathname.split("/")[1] || "id";
      window.location.href = `/${locale}/login`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />

      <button className="icon-btn" aria-label={t("notifications")}>
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
      </button>

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 ml-1 p-1.5 pr-3 rounded-full hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none"
        >
          <Avatar className="h-9 w-9 shrink-0 border border-primary/10 shadow-sm relative">
            <AvatarImage src={user?.avatar_url || ""} alt={displayName} className="z-20" />
            <AvatarFallback className="absolute inset-0 bg-primary text-primary-foreground font-bold text-sm z-10 flex items-center justify-center">
                {firstLetter || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-foreground leading-none">{displayName || t("loading")}</p>
            {displayRole && !isDuplicate && (
              <p className="text-xs font-medium text-muted-foreground mt-0.5 capitalize">{displayRole}</p>
            )}
          </div>
          <ChevronDown className={`hidden lg:block h-4 w-4 text-foreground/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="dropdown-panel">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{displayRole}</p>
            </div>
            <div className="dropdown-divider" />
            <Link href="/profile" onClick={() => setIsOpen(false)} className="dropdown-item">
              <User className="h-4 w-4 text-muted-foreground" />
              {t("profile")}
            </Link>
            {user?.roles?.includes("umkm") && (
              <Link href="/umkm-profile" onClick={() => setIsOpen(false)} className="dropdown-item">
                <Store className="h-4 w-4 text-muted-foreground" />
                {t("umkm_identity") || "Identitas UMKM"}
              </Link>
            )}
            <button onClick={() => setIsOpen(false)} className="dropdown-item">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {t("settings")}
            </button>
            <div className="dropdown-divider" />
            <button onClick={handleLogout} className="dropdown-item-danger">
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};