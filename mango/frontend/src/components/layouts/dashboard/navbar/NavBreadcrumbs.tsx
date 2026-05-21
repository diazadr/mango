"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Global label registry — pages call setBreadcrumbLabel(id, "Human Name") to override
declare global {
  interface Window {
    __breadcrumbLabels?: Record<string, string>;
  }
}

export function setBreadcrumbLabel(segment: string, label: string) {
  if (typeof window !== "undefined") {
    window.__breadcrumbLabels = window.__breadcrumbLabels || {};
    window.__breadcrumbLabels[segment] = label;
    window.dispatchEvent(new CustomEvent("breadcrumb-update"));
  }
}

export const NavBreadcrumbs = () => {
  const t = useTranslations("DashboardNavbar");
  const pathname = usePathname();
  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => setLabels({ ...(window.__breadcrumbLabels || {}) });
    update();
    window.addEventListener("breadcrumb-update", update);
    return () => window.removeEventListener("breadcrumb-update", update);
  }, [pathname]);

  // Define segments that should not be clickable links
  const nonClickableSegments = ["admin", "workspace"];

  const pathSegments = pathname
    .split('/')
    .filter(segment => segment && !['en', 'id'].includes(segment));

  const getLabel = (segment: string) => {
    if (/^\d+$/.test(segment)) {
      return labels[segment] || `#${segment}`;
    }
    return (labels[segment] || segment).replace(/-/g, ' ');
  };

  return (
    <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <Link href="/dashboard" className="hover:text-primary transition-colors duration-200 flex items-center">
        <LayoutDashboard size={16} />
      </Link>
      
      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const isClickable = !nonClickableSegments.includes(segment) && !isLast;
        const label = getLabel(segment);

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-foreground/25" />
            {isClickable ? (
              <Link 
                href={href} 
                className="hover:text-primary transition-colors duration-200 capitalize"
              >
                {label}
              </Link>
            ) : (
              <span 
                className={`capitalize ${
                  isLast ? "text-foreground font-semibold" : "text-muted-foreground/60 cursor-default"
                }`}
              >
                {label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
