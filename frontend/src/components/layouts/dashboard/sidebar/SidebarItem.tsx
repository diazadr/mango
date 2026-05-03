import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";

interface Props {
  nameKey: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
}

export const SidebarItem = ({ nameKey, href, icon: Icon, isActive, collapsed }: Props) => {
  const t = useTranslations("DashboardSidebar");

  return (
    <Link 
      href={href} 
      className={`sidebar-item group ${collapsed ? "justify-center" : ""} ${
        isActive ? "sidebar-item-active" : "sidebar-item-inactive"
      }`}
      title={collapsed ? t(`menu.${nameKey}`) : undefined}
    >
      {isActive && !collapsed && (
        <div className="absolute left-0 w-1 h-5 bg-sidebar-primary rounded-r-full" />
      )}
      <Icon 
        size={18} 
        className={`sidebar-icon ${
          isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground group-hover:text-primary"
        }`} 
      />
      {!collapsed && (
        <span className="whitespace-nowrap overflow-hidden">{t(`menu.${nameKey}`)}</span>
      )}
    </Link>
  );
};