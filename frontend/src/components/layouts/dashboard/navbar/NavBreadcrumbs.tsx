"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/src/i18n/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";

export const NavBreadcrumbs = () => {
  const t = useTranslations("DashboardNavbar");
  const pathname = usePathname();
  
  // Define segments that should not be clickable links
  const nonClickableSegments = ["admin", "workspace"];

  const pathSegments = pathname
    .split('/')
    .filter(segment => segment && !['en', 'id'].includes(segment));

  return (
    <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <Link href="/dashboard" className="hover:text-primary transition-colors duration-200 flex items-center">
        <LayoutDashboard size={16} />
      </Link>
      
      {pathSegments.map((segment, index) => {
        // Build the URL based on the actual segments in the URL
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const isClickable = !nonClickableSegments.includes(segment) && !isLast;

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-foreground/25" />
            {isClickable ? (
              <Link 
                href={href} 
                className="hover:text-primary transition-colors duration-200 capitalize"
              >
                {segment.replace(/-/g, ' ')}
              </Link>
            ) : (
              <span 
                className={`capitalize ${
                  isLast ? "text-foreground font-semibold" : "text-muted-foreground/60 cursor-default"
                }`}
              >
                {segment.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};