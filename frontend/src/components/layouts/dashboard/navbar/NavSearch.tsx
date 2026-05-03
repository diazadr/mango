"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export const NavSearch = () => {
  const t = useTranslations("DashboardNavbar");
  
  return (
    <div className="relative w-full max-w-sm hidden md:flex items-center">
      <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={t("search_placeholder")}
        className="flex h-10 w-full rounded-full border border-border bg-muted/50 px-4 py-2 pl-10 text-sm font-medium shadow-none transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background focus-visible:border-primary/30"
      />
    </div>
  );
};