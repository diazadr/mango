"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/src/i18n/navigation";
import { ChevronDown, User, Settings, LogOut, Store, MoreVertical } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "next-intl";
import { web } from "@/src/lib/http/axios";
import Cookies from "js-cookie";

import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

export const NavActions = ({ user }: { user: any }) => {
  const t = useTranslations("DashboardNavbar");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawRole = user?.roles?.[0] || "";
  const displayRole = rawRole.replace('_', ' ');
  const displayName = user?.name || "";
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : "";
  const isDuplicate = displayName && displayRole && displayName.toLowerCase() === displayRole.toLowerCase();

  const handleLogout = async () => {
    try {
      await web.get("/sanctum/csrf-cookie");
      await web.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("token", { path: "/" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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

      <div className="relative" ref={dropdownRef}>
        {/* Desktop trigger: avatar + nama + chevron */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex items-center gap-2.5 ml-1 p-1.5 pr-3 rounded-full hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none"
        >
          <Avatar className="h-9 w-9 shrink-0 shadow-sm relative rounded-xl bg-primary/5">
            {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={displayName} className="z-20 rounded-xl object-contain p-0.5" />
            ) : (
                <AvatarFallback className="absolute inset-0 bg-primary/10 text-primary font-bold text-sm z-10 flex items-center justify-center rounded-xl">
                  {firstLetter || <User className="h-4 w-4" />}
                </AvatarFallback>
            )}
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground leading-none">{displayName || t("loading")}</p>
            {displayRole && !isDuplicate && (
              <p className="text-xs font-medium text-muted-foreground mt-0.5 capitalize">{displayRole}</p>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-foreground/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Mobile trigger: avatar kecil + titik tiga */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex items-center gap-1 p-1.5 rounded-xl hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none"
        >
          <Avatar className="h-8 w-8 shrink-0 relative rounded-lg bg-primary/5">
            {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={displayName} className="z-20 rounded-lg object-contain p-0.5" />
            ) : (
                <AvatarFallback className="absolute inset-0 bg-primary/10 text-primary font-bold text-xs z-10 flex items-center justify-center rounded-lg">
                  {firstLetter || <User className="h-3.5 w-3.5" />}
                </AvatarFallback>
            )}
          </Avatar>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
            <Link href="/settings" onClick={() => setIsOpen(false)} className="dropdown-item">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {t("settings")}
            </Link>
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
